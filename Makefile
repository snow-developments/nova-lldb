SOURCES := $(shell find lldb.novaextension/Scripts -name '*.js')

ARCH := $(shell uname -m)
CODELLDB_VERSION := v1.9.0
LLDB_PACKAGE_ARCHIVE := "https://github.com/vadimcn/codelldb/releases/download/$(CODELLDB_VERSION)/codelldb-$(ARCH)-darwin.vsix"
LLDB_PACKAGE := build/lldb/archive/extension/lldb

$(info $(LLDB_PACKAGE_ARCHIVE))

.DEFAULT_GOAL := codelldb
all: codelldb

codelldb: lldb.novaextension/bin/codelldb
.PHONY: codelldb
build/lldb/archive:
	mkdir -p build/lldb
	curl -L $(LLDB_PACKAGE_ARCHIVE) --output build/lldb/archive.zip
	unzip build/lldb/archive.zip -d build/lldb/archive
lldb.novaextension/bin/codelldb: codelldb/adapter/CMakeLists.txt
	mkdir -p lldb.novaextension/bin
	cmake -DCMAKE_BUILD_TYPE=Debug -DLLDB_PACKAGE=$(LLDB_PACKAGE) -Bbuild codelldb
codelldb/adapter/CMakeLists.txt:
	git submodule update --init --recursive

Traffic.pdx: $(SOURCES) views/pdxinfo
	rm -rf Traffic.pdx dist
	dub build

# watch:
# 	@-dub test
# 	@echo "Watching JS sources..."
# 	@fswatch -o lldb.novaextension/extension.json $(SOURCES) | xargs -n1 -I{} dub test
# .PHONY: watch

clean:
	rm -rf lldb.novaextension/bin build/CMakeCache.txt
	rm -rf build/lldb/archive.zip
.PHONY: clean
