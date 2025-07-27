#include <emscripten/bind.h>
#include <vector>
#include "optimizer.hpp"


std::vector<std::size_t> optimize(int num_groups, int num_people, int num_roles, int num_tables, int num_weeks) {
	struct config_t config;
	config.num_groups = num_groups;
	config.num_people = num_people;
	config.num_roles = num_roles;
	config.num_tables = num_tables;
	config.num_weeks = num_weeks;

	optimizer optim(config);
	optim.optimize();
	return optim.serialize();
}

EMSCRIPTEN_BINDINGS(my_module) {
	emscripten::function("optimize", &optimize);
	emscripten::register_vector<std::size_t>("VectorSizeT");
}