#include <emscripten/bind.h>
#include <emscripten.h>
#include <vector>
#include "optimizer.hpp"

EM_JS(void, report_progress, (double value), {
    if (typeof Module.reportProgress === "function") {
        Module.reportProgress(value);
    }
});

class custom_optimizer: public optimizer {
	public:

	custom_optimizer(const struct config_t &t_config): optimizer(t_config) {}

	private:
	void on_finished_week(c_size_t t_week) override {
		const double progress = (static_cast<double>(t_week) + 1.0) / get_config().num_weeks;
		report_progress(progress);
	}
};

std::vector<std::size_t> optimize(int num_groups, int num_people, int num_roles, int num_tables, int num_weeks) {
	struct config_t config;
	
	config.num_groups = num_groups;
	config.num_people = num_people;
	config.num_roles = num_roles;
	config.num_tables = num_tables;
	config.num_weeks = num_weeks;
	custom_optimizer optim(config);
	optim.optimize();
	return optim.serialize();
}

EMSCRIPTEN_BINDINGS(Module) {
	emscripten::function("optimize", &optimize);
	emscripten::register_vector<std::size_t>("VectorSizeT");
}


