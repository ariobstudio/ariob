#!/bin/bash
# Copyright 2024 Ariob Application. All rights reserved.
# Flexible iOS bundle build script for Ariob apps
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
APP_NAME=""
SKIP_POD_INSTALL=false
FORCE_INSTALL=false
CLEAN_BUILD=false
VERBOSE=false

# Determine root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
    echo -e "${BLUE}Ariob iOS Bundle Build Script${NC}"
    echo "======================================"
    echo ""
    echo "Usage: $0 <app_name> [OPTIONS]"
    echo ""
    echo "Arguments:"
    echo "  app_name             Name of the app to build (e.g., brana, andromeda)"
    echo ""
    echo "Options:"
    echo "  -s, --skip-pods      Skip CocoaPods installation"
    echo "  -f, --force-install  Force reinstall all npm dependencies"
    echo "  -c, --clean          Clean build artifacts before building"
    echo "  -v, --verbose        Enable verbose output"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 brana                          # Build brana app with default settings"
    echo "  $0 andromeda --verbose            # Build andromeda with detailed output"
    echo "  $0 brana --clean --force-install  # Clean build with fresh dependencies"
    echo ""
    echo "Note:"
    echo "  All .lynx.bundle files from the app's dist folder will be copied to"
    echo "  the iOS Resource directory, preserving their original names."
    echo ""
    echo "Environment Variables:"
    echo "  ARIOB_ROOT          Override project root directory"
    echo ""
}

# Parse command line arguments
parse_args() {
    if [ $# -eq 0 ]; then
        echo -e "${RED}Error: No app name provided${NC}"
        usage
        exit 1
    fi

    # First argument is the app name
    APP_NAME="$1"
    shift

    # Parse remaining options
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--skip-pods)
                SKIP_POD_INSTALL=true
                shift
                ;;
            -f|--force-install)
                FORCE_INSTALL=true
                shift
                ;;
            -c|--clean)
                CLEAN_BUILD=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                usage
                exit 1
                ;;
        esac
    done
}

# Verify app directory exists
verify_app() {
    local app_dir="$ROOT_DIR/apps/$APP_NAME"

    if [ ! -d "$app_dir" ]; then
        echo -e "${RED}Error: App directory not found: $app_dir${NC}"
        echo "Available apps:"
        ls -d "$ROOT_DIR/apps"/*/ 2>/dev/null | xargs -n 1 basename | sed 's/^/  - /'
        exit 1
    fi

    if [ ! -f "$app_dir/package.json" ]; then
        echo -e "${RED}Error: No package.json found in $app_dir${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Found app: $APP_NAME${NC}"
}

# Detect package manager
detect_package_manager() {
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

    echo -e "${BLUE}Using package manager: $PKG_MANAGER${NC}"
}

# Build the app
build_app() {
    local app_dir="$ROOT_DIR/apps/$APP_NAME"

    echo -e "\n${GREEN}Building $APP_NAME app...${NC}"
    echo "-------------------------------------"

    pushd "$app_dir" > /dev/null

    # Clean build if requested
    if [ "$CLEAN_BUILD" == "true" ]; then
        echo -e "${YELLOW}Cleaning previous build artifacts...${NC}"
        rm -rf dist node_modules package-lock.json pnpm-lock.yaml yarn.lock .turbo
        echo -e "${GREEN}✓ Clean completed${NC}"
    fi

    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ "$FORCE_INSTALL" == "true" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        if [ "$VERBOSE" == "true" ]; then
            $PKG_MANAGER install --no-frozen-lockfile
        else
            $PKG_MANAGER install --no-frozen-lockfile > /dev/null 2>&1
        fi

        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to install dependencies${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    else
        echo "Dependencies already installed, skipping..."
    fi

    # Build the app
    echo -e "${YELLOW}Running build...${NC}"
    if [ "$VERBOSE" == "true" ]; then
        $PKG_MANAGER run build
    else
        $PKG_MANAGER run build > /dev/null 2>&1
    fi

    if [ $? -ne 0 ]; then
        echo -e "${RED}Build failed! Run with -v for detailed output.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Build completed${NC}"
    popd > /dev/null
}

# Copy bundle to iOS Resource
copy_bundle() {
    local app_dir="$ROOT_DIR/apps/$APP_NAME"
    local resource_dir="$ROOT_DIR/platforms/ios/Ariob/Ariob/Resource"

    echo -e "\n${GREEN}Copying bundle to iOS Resource...${NC}"
    echo "-------------------------------------"

    # Create Resource directory if it doesn't exist
    mkdir -p "$resource_dir"

    # Check if dist directory exists
    if [ ! -d "$app_dir/dist" ]; then
        echo -e "${RED}Error: dist directory not found after build${NC}"
        exit 1
    fi

    # Find and copy all .lynx.bundle files, preserving original names
    local bundle_count=0

    shopt -s nullglob  # Handle case when no matches found
    for bundle_file in "$app_dir/dist"/*.lynx.bundle; do
        if [ -f "$bundle_file" ]; then
            local bundle_name=$(basename "$bundle_file")
            local target_path="$resource_dir/$bundle_name"

            echo -e "Copying: ${YELLOW}$bundle_name${NC}"
            echo -e "  Source: $bundle_file"
            echo -e "  Target: $target_path"

            cp "$bundle_file" "$target_path"

            # Calculate and display size
            local file_size=$(du -h "$target_path" | cut -f1)
            echo -e "  Size: ${BLUE}$file_size${NC}"
            echo ""

            bundle_count=$((bundle_count + 1))
        fi
    done
    shopt -u nullglob

    # Report results
    if [ $bundle_count -eq 0 ]; then
        echo -e "${YELLOW}Warning: No .lynx.bundle files found in dist directory${NC}"
        echo "Contents of dist directory:"
        ls -lh "$app_dir/dist/" 2>/dev/null || echo "  (empty)"
        echo ""
        echo -e "${RED}Error: No bundle files found to copy${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ Successfully copied $bundle_count bundle file(s)${NC}"
    fi

    # Copy static assets (fonts, icons, etc.) to Resource/icons/
    copy_static_assets "$app_dir" "$resource_dir"
}

# Copy static assets like fonts to Resource directory
copy_static_assets() {
    local app_dir="$1"
    local resource_dir="$2"
    local static_dir="$app_dir/dist/static"
    local icons_dir="$resource_dir/icons"

    if [ ! -d "$static_dir" ]; then
        echo -e "${YELLOW}No static directory found, skipping static assets${NC}"
        return
    fi

    echo -e "\n${GREEN}Copying static assets...${NC}"
    echo "-------------------------------------"

    # Create icons directory
    mkdir -p "$icons_dir"

    local asset_count=0

    # Copy fonts
    if [ -d "$static_dir/font" ]; then
        echo -e "Copying fonts..."
        shopt -s nullglob
        for font_file in "$static_dir/font"/*.{ttf,otf,woff,woff2}; do
            if [ -f "$font_file" ]; then
                local font_name=$(basename "$font_file")
                cp "$font_file" "$icons_dir/$font_name"
                echo -e "  ${YELLOW}$font_name${NC} → icons/"
                asset_count=$((asset_count + 1))
            fi
        done
        shopt -u nullglob
    fi

    # Copy images if they exist
    if [ -d "$static_dir/images" ]; then
        echo -e "Copying images..."
        shopt -s nullglob
        for img_file in "$static_dir/images"/*.{png,jpg,jpeg,svg,webp}; do
            if [ -f "$img_file" ]; then
                local img_name=$(basename "$img_file")
                cp "$img_file" "$icons_dir/$img_name"
                echo -e "  ${YELLOW}$img_name${NC} → icons/"
                asset_count=$((asset_count + 1))
            fi
        done
        shopt -u nullglob
    fi

    # Copy icons if they exist
    if [ -d "$static_dir/icons" ]; then
        echo -e "Copying icons..."
        shopt -s nullglob
        for icon_file in "$static_dir/icons"/*.{png,jpg,jpeg,svg,webp,ico}; do
            if [ -f "$icon_file" ]; then
                local icon_name=$(basename "$icon_file")
                cp "$icon_file" "$icons_dir/$icon_name"
                echo -e "  ${YELLOW}$icon_name${NC} → icons/"
                asset_count=$((asset_count + 1))
            fi
        done
        shopt -u nullglob
    fi

    if [ $asset_count -gt 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Copied $asset_count static asset(s)${NC}"
    else
        echo -e "${YELLOW}No static assets found to copy${NC}"
    fi
}

# Install iOS dependencies
install_ios_dependencies() {
    if [ "$SKIP_POD_INSTALL" == "true" ]; then
        echo -e "\n${YELLOW}Skipping CocoaPods installation (--skip-pods)${NC}"
        return
    fi

    echo -e "\n${GREEN}Installing iOS Dependencies${NC}"
    echo "-------------------------------------"

    local ios_dir="$ROOT_DIR/platforms/ios/Ariob"

    if [ ! -d "$ios_dir" ]; then
        echo -e "${RED}Error: iOS project directory not found: $ios_dir${NC}"
        exit 1
    fi

    pushd "$ios_dir" > /dev/null

    # Check if CocoaPods is installed
    if ! command -v pod &> /dev/null; then
        echo -e "${RED}Error: CocoaPods is not installed${NC}"
        echo "Please install CocoaPods: sudo gem install cocoapods"
        exit 1
    fi

    echo -e "${YELLOW}Running pod install...${NC}"

    # Clean previous pods if requested
    if [ "$CLEAN_BUILD" == "true" ]; then
        pod deintegrate 2>/dev/null || true
        rm -rf Pods Podfile.lock
    fi

    # Run pod install
    if [ "$VERBOSE" == "true" ]; then
        pod install --verbose
    else
        pod install > /dev/null 2>&1
    fi

    if [ $? -ne 0 ]; then
        echo -e "${RED}Pod installation failed! Run with -v for detailed output.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Pod installation completed${NC}"
    popd > /dev/null
}

# Main execution
main() {
    parse_args "$@"

    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  Ariob iOS Bundle Build Script${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
    echo -e "App: ${YELLOW}$APP_NAME${NC}"
    echo -e "Root: $ROOT_DIR"
    echo ""

    # Execute build steps
    verify_app
    detect_package_manager
    build_app
    copy_bundle
    install_ios_dependencies

    # Final summary
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✓ Bundle Build Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo "Resource directory:"
    echo "  $ROOT_DIR/platforms/ios/Ariob/Ariob/Resource/"
    echo ""
    echo "Next steps:"
    echo "  1. Open Xcode: open $ROOT_DIR/platforms/ios/Ariob/Ariob.xcworkspace"
    echo "  2. Select your target device or simulator"
    echo "  3. Build and run the project (Cmd+R)"
    echo ""
}

# Run main function
main "$@"