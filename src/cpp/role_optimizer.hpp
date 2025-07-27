#ifndef ROLE_OPTIMIZER_HPP
#define ROLE_OPTIMIZER_HPP
#include "common.hpp"
#include <vector>

class role_optimizer {
private:
    const struct config_t m_config;
    // store temporary results
    size_vec_t m_tmp;
    // store which person has been assigned which role, shape: people*num_roles
    std::vector<size_vec_t > m_roles;

public:

    role_optimizer(const struct config_t &t_config): 
    m_config(t_config),
    m_roles(t_config.num_people) {
        m_tmp.reserve(m_config.num_people);
        // ceiling divide        
        for(size_vec_t &person_roles: m_roles) {
            person_roles.reserve(m_config.num_roles);
        }
    }

    c_size_vec_t &optimize(c_size_t t_role, c_size_vec_t &t_available_people) {
        // only optimize for roles that are neccessary
        // if there is only one option, return the option
        if(t_role >= m_config.num_roles || t_available_people.size() == 1) {
            return t_available_people;
        }
        
        std::size_t min_role_occurence_count = SIZE_MAX;

        for(c_size_t person : t_available_people) {
            std::size_t person_role_count = 0;

            for(c_size_t person_role: m_roles[person]) {
                if(person_role == t_role) {
                    person_role_count++;
                }
            }

            // we select those t_available_people who have had the t_role the least
            // of those, we select those who have had the least roles
            if(person_role_count < min_role_occurence_count) {
                min_role_occurence_count = person_role_count;
                m_tmp.clear();
                m_tmp.push_back(person);
            } else if(person_role_count == min_role_occurence_count) {
                std::size_t selected_person = m_tmp[0];
                std::size_t selection_role_count = m_roles[selected_person].size();
                std::size_t person_role_count = m_roles[person].size();
                
                if(person_role_count < selection_role_count) {
                    m_tmp.clear();
                    m_tmp.push_back(person);
                } else if(person_role_count == selection_role_count) {
                    m_tmp.push_back(person);
                }
            }
        }

        return m_tmp;
    }

    void reset() {
        for(size_vec_t &person_roles: m_roles) {
            person_roles.clear();
        }
    }

    void record(c_size_t t_person, c_size_t t_role) {
        m_roles[t_person].push_back(t_role);
    }

};


#endif // #ifndef ROLE_OPTIMIZER_HPP