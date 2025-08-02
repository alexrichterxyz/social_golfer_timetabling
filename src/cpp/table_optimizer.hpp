
#ifndef TABLE_OPTMIZER_HPP
#define TABLE_OPTMIZER_HPP
#include <vector>
#include "common.hpp"

class table_optimizer {
private:
    const struct config_t m_config;
    // used to store the number of times each user has been at each table
    // shape: tables * user
    size_vec_t m_counts;
    // used to store temporary results
    size_vec_t m_tmp;
    // store which group has been allocated which table
    // shape: num_weeks*num_groups
    size_vec_t m_allocation;

    std::size_t get_count_for(c_size_t t_person, c_size_t t_table) const {
        return m_counts[t_table * m_config.num_people + t_person];
    }

public:

    inline table_optimizer(const struct config_t t_config): 
    m_config(t_config),
    m_counts(t_config.num_tables * t_config.num_people, 0),
    m_allocation(t_config.num_weeks * t_config.num_groups, 0) {
        m_tmp.reserve(m_config.num_people);
    }

    inline c_size_vec_t &optimize(c_size_t t_week, c_size_vec_t &t_group_members, c_size_vec_t &t_available_people) {
        // if there is only one option to choose from, return that option
        // in the first week, noone has been at any table yet, so skip optimization
        if(t_available_people.size() == 1 || t_week == 0) {
            return t_available_people;
        }

        m_tmp.clear();

        // we try to select the people that have been at the "most similar tables"
        // as the people in t_group_members
        std::size_t max_distance = 0;

        for(const auto person: t_available_people) {
            std::size_t person_distance = 0;

            for(const auto member: t_group_members) {
                for(std::size_t table = 0; table < m_config.num_tables; table++) {
                    person_distance += get_count_for(person, table) * get_count_for(member, table);
                }
            }

            if(person_distance > max_distance) {
                max_distance = person_distance;
                m_tmp.clear();
                m_tmp.push_back(person);
            } else if(person_distance == max_distance) {
                m_tmp.push_back(person);
            }
        }

        return m_tmp;
    }

    inline void record(c_size_t t_week, c_size_t t_group, c_size_vec_t t_group_members, c_size_t t_table) {
        for(const auto member: t_group_members) {
            m_counts[t_table * m_config.num_people + member]++;
        }

        m_allocation[t_week * m_config.num_groups + t_group] = t_table;
    }

    inline std::size_t get_table_for(c_size_t t_week, c_size_t t_group) const {
        return m_allocation[t_week * m_config.num_groups + t_group];
    }

    inline c_size_vec_t &best_tables_for(c_size_vec_t &t_group_members, c_size_vec_t &t_available_tables) {
        // if there is only one option to choose from, return that option
        if(t_available_tables.size() == 1) {
            return t_available_tables;
        }


        // select the tables that the group members have collectively been at the least
        std::size_t min_count = SIZE_MAX;

        for(const auto table : t_available_tables) {
            std::size_t table_count = 0;
            
            for(const auto member: t_group_members) {
                table_count += get_count_for(member, table);
            }

            if(table_count < min_count) {
                min_count = table_count;
                m_tmp.clear();
                m_tmp.push_back(table);
            } else if(table_count == min_count) {
                m_tmp.push_back(table);
            }

        }

        return m_tmp;
    }

    inline void reset() {
        std::fill(m_allocation.begin(), m_allocation.end(), 0);
        std::fill(m_counts.begin(), m_counts.end(), 0);
    }
};


#endif // #ifndef TABLE_OPTMIZER_HPP