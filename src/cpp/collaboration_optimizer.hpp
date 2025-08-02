#ifndef COLLABORATION_OPTIMIZER_HPP
#define COLLABORATION_OPTIMIZER_HPP
#include <vector>
#include <iostream>
#include "common.hpp"


class collaboration_optimizer {
    private:
    const struct config_t m_config;
    // tacks collaboration count between 2 people, shape: num_people^2
    size_vec_t m_counts;
    // used to store temporary results
    size_vec_t m_tmp;

    public:
    
    inline collaboration_optimizer(const struct config_t &t_config):
    m_config(t_config),
    m_counts(t_config.num_people * t_config.num_people, 0) {
        m_tmp.reserve(t_config.num_people);
    };

    inline void record(c_size_vec_t &t_group_members, c_size_t t_new_member) {
        for(const auto member: t_group_members) {
            m_counts[m_config.num_people * member + t_new_member]++;
            m_counts[m_config.num_people * t_new_member + member]++;
        }
    }

    // get sample of best new group members
    inline c_size_vec_t &optimize(c_size_vec_t &t_group_members, c_size_vec_t &t_available_people) {
        // if only one option remaining, return that option
        if(t_available_people.size() == 1) {
            return t_available_people;
        }
        
        // in the following we store select from t_available_people
        // those that we have collaborated least
        std::size_t min_count = SIZE_MAX;

        for(c_size_t person: t_available_people) {
            std::size_t count = 0;
            c_size_t count_offset = person * m_config.num_people;

            for(const auto &member: t_group_members) {
                count += m_counts[count_offset + member];
                
                if(count > min_count) {
                    break;
                }
            }

            if(count < min_count) {
                min_count = count;
                m_tmp.clear();
                m_tmp.push_back(person);
            } else if(count == min_count) {
                m_tmp.push_back(person);
            }
        }

        return m_tmp;
    }

    inline void reset() {
        std::fill(m_counts.begin(), m_counts.end(), 0);
    }

    friend std::ostream& operator<<(std::ostream& t_os, const collaboration_optimizer& t_optimizer);
};

// print collaboration count matrix
std::ostream& operator<<(std::ostream& t_os, const collaboration_optimizer& t_optimizer) {
    c_size_t num_people = t_optimizer.m_config.num_people;
    
    for(std::size_t row = 0; row < num_people; row++) {
        c_size_t count_offset = row * num_people;

        for(std::size_t col = 0; col < num_people; col++) {
            t_os << t_optimizer.m_counts[count_offset + col] << ' ';
        }

        t_os << '\n';
    }

    return t_os;
}


#endif // #ifndef COLLABORATION_OPTIMIZER_HPP