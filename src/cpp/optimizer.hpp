#ifndef OPTIMIZER_HPP
#define OPTIMIZER_HPP
#include "common.hpp"
#include <vector>
#include <bitset>
#include <numeric>
#include <algorithm>
#include "role_optimizer.hpp"
#include "collaboration_optimizer.hpp"
#include "table_optimizer.hpp"


class optimizer {
    private:
    const struct config_t m_config;
    // optimization result, shape: num_weeks * num_groups, members
    std::vector<size_vec_t> m_result;
    collaboration_optimizer m_colaboration_optimizer;
    role_optimizer m_role_optimizer;
    table_optimizer m_table_optimizer;

    inline size_vec_t &members_for(c_size_t t_week, c_size_t t_group) {
        return m_result[t_week * m_config.num_groups + t_group];
    }

    protected:
    inline virtual void on_finished_week(c_size_t t_week) {}

    public:

    inline optimizer(const struct config_t &t_config):
    m_config(t_config),
    m_result(t_config.num_weeks * t_config.num_groups),
    m_colaboration_optimizer(t_config),
    m_role_optimizer(t_config),
    m_table_optimizer(t_config) {}

    const struct config_t &get_config() const {
        return m_config;
    }

    inline void optimize_week(c_size_t t_week) {
        // in the following we're generating an array of people (available_people)
        // who haven't been allocated to groups yet
        std::bitset<MAX_PEOPLE> allocated_people_set;

        for(std::size_t group = 0; group < m_config.num_groups; group++) {
            for(c_size_t member: members_for(t_week, group)) {
                allocated_people_set.set(member);
            }
        }

        size_vec_t available_people;
        available_people.reserve(m_config.num_people);

        for(std::size_t person = 0; person < m_config.num_people; person++) {
            if(allocated_people_set.test(person)) {
                continue;
            }

            available_people.push_back(person);
        }

        std::size_t group = 0;

        while(!available_people.empty()) {
            size_vec_t &group_members = members_for(t_week, group);
            // group members are recorded in a vector
            // the position of each person determines their role
            // e.g. first person gets first role, etc.
            // the following code performs different optimizations and returns the 
            // sample of the "best" people. The order of optimization steps can be changed
            c_size_t role = group_members.size();
            c_size_vec_t &sample_1 = m_colaboration_optimizer.optimize(group_members, available_people);
            c_size_vec_t &sample_2 = m_role_optimizer.optimize(role, sample_1);
            c_size_vec_t &sample_3 = m_table_optimizer.optimize(t_week, group_members, sample_2);
            c_size_t new_member = sample_3[0];
           
            // available people are guaranteed to be in orde, thus can do binary search
            available_people.erase(std::lower_bound(
                available_people.begin(),
                available_people.end(),
                new_member
            ));

            m_colaboration_optimizer.record(group_members, new_member);
            m_role_optimizer.record(new_member, role);
            group_members.emplace_back(new_member);
            
            if(++group >= m_config.num_groups) {
                group = 0;
            }
        }

        // assign tables
        size_vec_t available_tables(m_config.num_tables);
        std::iota(available_tables.begin(), available_tables.end(), 0);

        for(std::size_t group = 0; group < m_config.num_groups; group++) {
            size_vec_t &group_members = members_for(t_week, group);
            c_size_vec_t &best_table_options = m_table_optimizer.best_tables_for(group_members, available_tables);
            c_size_t selected_table = best_table_options[0];
            m_table_optimizer.record(t_week, group, group_members, selected_table);
            // tables are guaranteed to be in order so use binary search
            available_tables.erase(std::lower_bound(
                available_tables.begin(),
                available_tables.end(),
                selected_table
            ));
        }

        on_finished_week(t_week);
    }


    inline void optimize() {
        m_colaboration_optimizer.reset();
        m_role_optimizer.reset();
        m_table_optimizer.reset();
        // ceiling divide
        c_size_t max_group_members = (m_config.num_people + m_config.num_groups - 1) / m_config.num_groups;
        
        // for each week and group, we assign an initial group member
        // since the order in which group members are assigned to groups determines their role,
        // we already define who will get the first role (e.g. group leader)
        for(std::size_t i = 0; i < m_config.num_weeks * m_config.num_groups; i++) {
            m_result[i].clear();
            m_result[i].reserve(max_group_members);
            c_size_t person = i % m_config.num_people;
            m_result[i].push_back(person); // assign first person to group
            m_role_optimizer.record(person, 0);
        }

        for(std::size_t week = 0; week < m_config.num_weeks; week++) {
            optimize_week(week);
        }

    }

    inline size_vec_t serialize() {
        c_size_t max_group_members = (m_config.num_people + m_config.num_groups - 1) / m_config.num_groups;

        size_vec_t serialization;
        serialization.reserve(
            // for each group and week we store how many members is has
            m_config.num_weeks * m_config.num_groups
            //for each group and each week we have: person, role, and table
            + m_config.num_weeks * m_config.num_groups * max_group_members * 3
        );
        
        for(std::size_t week = 0; week < m_config.num_weeks; week++) {
            for(std::size_t group = 0; group < m_config.num_groups; group++) {
                c_size_vec_t &group_members = members_for(week, group);
                c_size_t table = m_table_optimizer.get_table_for(week, group);
                serialization.push_back(group_members.size());

                for(std::size_t member_idx = 0; member_idx < group_members.size(); member_idx++) {
                    c_size_t role = member_idx;
                    c_size_t person = group_members[member_idx];
                    serialization.push_back(person);
                    serialization.push_back(role);
                    serialization.push_back(table);
                }
            }
        }

        return  serialization;
    }
};

#endif // #ifndef OPTIMIZER