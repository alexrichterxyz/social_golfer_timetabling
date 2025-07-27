#ifndef COMMON_HPP
#define COMMON_HPP

#include <vector>

#ifndef MAX_PEOPLE
#define MAX_PEOPLE 65536
#endif

struct config_t {
    std::size_t num_people;
    std::size_t num_weeks;
    std::size_t num_groups;
    std::size_t num_roles;
    std::size_t num_tables;
};

using c_size_t = const std::size_t;
using size_vec_t = std::vector<std::size_t>;
using c_size_vec_t = const size_vec_t;


#endif // #ifndef COMMON_HPP