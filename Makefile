SOURCES := $(shell find lldb.novaextension/Scripts -name '*.js')

ARCH := $(shell uname -m)
CODELLDB_VERSION := v1.9.0
LLDB_PACKAGE_ARCHIVE := "https://github.com/vadimcn/codelldb/releases/download/$(CODELLDB_VERSION)/codelldb-$(ARCH)-darwin.vsix"
LLDB_PACKAGE := build/lldb/archive/extension/lldb

$(info $(LLDB_PACKAGE_ARCHIVE))

.DEFAULT_GOAL := codelldb
all: codelldb

codelldb: lldb.novaextension/bin/codelldb lldb.novaextension/lldb/lib/liblldb.dylib
.PHONY: codelldb
build/lldb/archive:
	mkdir -p build/lldb
	curl -L $(LLDB_PACKAGE_ARCHIVE) --output build/lldb/archive.zip
	unzip build/lldb/archive.zip -d build/lldb/archive
lldb.novaextension/bin/codelldb lldb.novaextension/bin/liblldb.dylib: codelldb/adapter/CMakeLists.txt
	mkdir -p lldb.novaextension/bin
# See https://github.com/vadimcn/codelldb/blob/master/BUILDING.md
	cmake -DCMAKE_BUILD_TYPE=Debug -DLLDB_PACKAGE=$(LLDB_PACKAGE) -Bbuild codelldb
	xcrun --sdk macosx make -C build codelldb_dylib codelldb_exe adapter
# TODO: Use release and debug configurations
	cp build/adapter/codelldb lldb.novaextension/bin/.
	cp build/adapter/libcodelldb.dylib lldb.novaextension/bin/.
# TODO: Fixup load paths to DLLs
	# /Users/chancesnow/GitHub/nova-lldb/lldb.novaextension/lldb/lib/liblldb.dylib
lldb.novaextension/lldb/lib/liblldb.dylib: build/lldb/archive
	mkdir -p lldb.novaextension/lldb
	cp -r build/lldb/archive/extension/lldb lldb.novaextension/.
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
	rm -rf lldb.novaextension/bin
	rm -rf build/CMakeCache.txt
	rm -rf build/lldb/archive.zip
.PHONY: clean
