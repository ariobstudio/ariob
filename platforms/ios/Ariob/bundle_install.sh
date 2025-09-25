#!/bin/bash
# Copyright 2024 Ariob Application. All rights reserved.
# Licensed under the Apache License Version 2.0 that can be found in the
# LICENSE file in the root directory of this source tree.
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Ariob iOS Bundle Installation${NC}"
echo "========================================="

# Determine root directory
if [ -n "$ARIOB_ROOT" ]; then
    root_dir="$ARIOB_ROOT"
else
    root_dir=$(pwd)/../../../
fi

# Resolve to absolute path
root_dir=$(readlink -f $root_dir 2>/dev/null || realpath $root_dir 2>/dev/null || echo $root_dir)

echo "Project root directory: $root_dir"

# Verify we're in the right location
if [ ! -d "$root_dir/apps/homepage" ]; then
    echo -e "${RED}Error: Cannot find apps/homepage directory at $root_dir/apps/homepage${NC}"
    echo "Please ensure you're running this script from platforms/ios/Ariob/"
    exit 1
fi
command="pod install --verbose --repo-update"
project_name="Ariob.xcworkspace"
enable_trace=true

usage() {
    echo "Ariob iOS Bundle Installation Script"
    echo "======================================"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo " -h, --help           Show this help message"
    echo " --skip-card-build    Skip additional app build tasks"
    echo " --integration-test   Build integration test demo pages"
    echo " --disable-trace      Disable trace logging"
    echo " --force-install      Force reinstall all npm dependencies"
    echo " --clean              Clean build artifacts before building"
    echo ""
    echo "This script builds the homepage app and installs iOS dependencies"
    echo ""
    echo "Environment Variables:"
    echo " ARIOB_ROOT          Override project root directory"
    echo ""
}

build_card_resources() {
    echo -e "${GREEN}Building Ariob homepage resources...${NC}"
    echo "-------------------------------------"

    # Create Resource directory for the iOS app
    local resource_dir="$root_dir/platforms/ios/Ariob/Ariob/Resources"
    echo "Creating iOS Resources directory at: $resource_dir"
    mkdir -p "$resource_dir"

    # Build homepage
    echo -e "\n${YELLOW}Building homepage from $root_dir/apps/homepage...${NC}"
    pushd "$root_dir/apps/homepage" > /dev/null

    # Clean build if requested
    if [ "$CLEAN_BUILD" == "true" ]; then
        echo -e "${YELLOW}Cleaning previous build artifacts...${NC}"
        rm -rf dist node_modules package-lock.json pnpm-lock.yaml yarn.lock
        echo -e "${GREEN}✓ Clean completed${NC}"
    fi

    # Check for package manager
    if command -v pnpm &> /dev/null; then
        PKG_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
    elif command -v yarn &> /dev/null; then
        PKG_MANAGER="yarn"
    else
        echo -e "${RED}Error: No package manager found (pnpm, npm, or yarn required)${NC}"
        exit 1
    fi

    echo "Using package manager: $PKG_MANAGER"

    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ "$FORCE_INSTALL" == "true" ]; then
        echo "Installing homepage dependencies..."
        $PKG_MANAGER install --no-frozen-lockfile || {
            echo -e "${RED}Failed to install dependencies${NC}"
            exit 1
        }
    else
        echo "Dependencies already installed, skipping..."
    fi

    # Build the homepage
    echo "Running homepage build..."
    $PKG_MANAGER run build || {
        echo -e "${RED}Build failed! Check the errors above.${NC}"
        exit 1
    }

    # Copy the built bundle to iOS Resources
    if [ -f "$root_dir/apps/homepage/dist/main.lynx.bundle" ]; then
        echo -e "${GREEN}✓ Copying homepage bundle to iOS Resources...${NC}"
        cp "$root_dir/apps/homepage/dist/main.lynx.bundle" "$resource_dir/homepage.lynx.bundle"
        echo -e "${GREEN}✓ Homepage bundle copied successfully${NC}"
    else
        echo -e "${YELLOW}Warning: main.lynx.bundle not found, checking for other bundle formats...${NC}"

        # Look for alternative bundle files
        if [ -d "$root_dir/apps/homepage/dist" ]; then
            echo "Contents of dist directory:"
            ls -la "$root_dir/apps/homepage/dist/"

            # Try to find any .js or .bundle file
            for file in "$root_dir/apps/homepage/dist"/*.{js,bundle}; do
                if [ -f "$file" ]; then
                    echo -e "${YELLOW}Found bundle file: $(basename $file)${NC}"
                    cp "$file" "$resource_dir/homepage.bundle"
                    echo -e "${GREEN}✓ Alternative bundle copied as homepage.bundle${NC}"
                    break
                fi
            done
        else
            echo -e "${RED}Error: dist directory not found after build${NC}"
            exit 1
        fi
    fi

    popd > /dev/null

    if [[ "$SKIP_CARD_BUILD" == "false" ]]; then
        # Check if there are other apps to build
        echo -e "\n${YELLOW}Checking for additional app builds...${NC}"

        # Build andromeda app if it exists and has a build script
        if [ -f "$root_dir/apps/andromeda/package.json" ]; then
            echo -e "${YELLOW}Found Andromeda app${NC}"
            # Uncomment below to enable Andromeda build
            # pushd "$root_dir/apps/andromeda" > /dev/null
            # $PKG_MANAGER install && $PKG_MANAGER run build
            # cp dist/*.bundle "$resource_dir/andromeda.bundle" 2>/dev/null || true
            # popd > /dev/null
        fi

        # Build ariob app if it exists and has a build script
        if [ -f "$root_dir/apps/ariob/package.json" ]; then
            echo -e "${YELLOW}Found Ariob app${NC}"
            # Uncomment below to enable Ariob app build
            # pushd "$root_dir/apps/ariob" > /dev/null
            # $PKG_MANAGER install && $PKG_MANAGER run build
            # cp dist/*.bundle "$resource_dir/ariob-app.bundle" 2>/dev/null || true
            # popd > /dev/null
        fi

        # Build brana app if it exists
        if [ -f "$root_dir/apps/brana/package.json" ]; then
            echo -e "${YELLOW}Found Brana app${NC}"
            # Uncomment below to enable Brana build
            # pushd "$root_dir/apps/brana" > /dev/null
            # $PKG_MANAGER install && $PKG_MANAGER run build
            # cp dist/*.bundle "$resource_dir/brana.bundle" 2>/dev/null || true
            # popd > /dev/null
        fi
    fi

    if [[ "$INTEGRATION_TEST" == "true" ]]; then
        echo -e "\n${YELLOW}Integration test mode enabled${NC}"
        # Add integration test build logic here if needed
        if [ -d "$root_dir/testing/integration_test" ]; then
            echo "Integration test directory found"
            # Add test build commands here
        fi
    fi

    echo -e "\n${GREEN}✓ Resource build completed successfully!${NC}"
    echo "-------------------------------------"
}

handle_options() {
    for i in "$@"; do
        case $i in
            -h | --help)
                usage
                exit 0
                ;;
            --skip-card-build)
                SKIP_CARD_BUILD=true
                ;;
            --integration-test)
                INTEGRATION_TEST=true
                ;;
            --disable-trace)
                enable_trace=false
                ;;
            --force-install)
                FORCE_INSTALL=true
                ;;
            --clean)
                CLEAN_BUILD=true
                ;;
            *)
                echo -e "${RED}Unknown option: $i${NC}"
                usage
                exit 1
                ;;
        esac
    done
}

# Default values for options
SKIP_CARD_BUILD=false
INTEGRATION_TEST=false
FORCE_INSTALL=false
CLEAN_BUILD=false

enable_trace_param=$([ $enable_trace == true ] && echo "--enable-trace" || echo "")

handle_options "$@"
build_card_resources

pushd $root_dir
# Check if GN tools are available for this project
if [ -f "$root_dir/tools/ios_tools/generate_podspec_scripts_by_gn.py" ]; then
    gn_root_dir=$(readlink -f $root_dir)
    echo "gn_root_dir: $gn_root_dir"
    generate_ios_podspec_cmd="python3 tools/ios_tools/generate_podspec_scripts_by_gn.py --root $gn_root_dir $enable_trace_param"
    echo "Running GN podspec generation: $generate_ios_podspec_cmd"
    eval "$generate_ios_podspec_cmd"
else
    echo "GN tools not found, skipping podspec generation"
fi
popd

# Navigate to iOS project directory
echo -e "\n${GREEN}Installing iOS Dependencies${NC}"
echo "-------------------------------------"
pushd "$root_dir/platforms/ios/Ariob" > /dev/null

# Prepare source cache
export COCOAPODS_CONVERT_GIT_TO_HTTP=false
export LANG=en_US.UTF-8

echo "Working directory: $(pwd)"
echo -e "${YELLOW}Installing CocoaPods dependencies for Ariob...${NC}"

# Check if bundler is needed
if [ -f "Gemfile" ]; then
    echo -e "${YELLOW}Found Gemfile, using bundler...${NC}"
    SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk bundle install -V --path="$root_dir" || {
        echo -e "${RED}Failed to install Ruby dependencies${NC}"
        exit 1
    }
    bundle exec pod deintegrate "$project_name" 2>/dev/null || echo "Deintegration skipped"
    rm -rf Podfile.lock
    echo -e "${YELLOW}Running: bundle exec $command${NC}"
    bundle exec $command || {
        echo -e "${RED}Pod installation failed!${NC}"
        exit 1
    }
else
    echo -e "${YELLOW}No Gemfile found, using pod directly...${NC}"

    # Check if CocoaPods is installed
    if ! command -v pod &> /dev/null; then
        echo -e "${RED}Error: CocoaPods is not installed${NC}"
        echo "Please install CocoaPods: sudo gem install cocoapods"
        exit 1
    fi

    pod deintegrate "$project_name" 2>/dev/null || echo "Deintegration skipped"
    rm -rf Podfile.lock
    echo -e "${YELLOW}Running: $command${NC}"
    eval $command || {
        echo -e "${RED}Pod installation failed!${NC}"
        exit 1
    }
fi

echo -e "${GREEN}✓ Pod installation completed successfully!${NC}"
popd > /dev/null

# Final summary
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Ariob iOS Bundle Installation Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Open Xcode: open $root_dir/platforms/ios/Ariob/Ariob.xcworkspace"
echo "2. Select your target device or simulator"
echo "3. Build and run the project (Cmd+R)"
echo ""
