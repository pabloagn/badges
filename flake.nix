{
  description = "Profile-cards – dev shell";

  inputs = {
    nixpkgs     .url = "github:NixOS/nixpkgs/nixos-23.11";
    flake-utils .url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          name = "badges-shell";
          buildInputs = with pkgs; [
            nodejs_20          # Node 20.x  (npm included)
            nodePackages.vercel  # optional: `vercel` CLI
            git
          ];
          shellHook = ''
            export NODE_ENV=development
            echo "Dev shell ready – run:  npm ci && npm run build"
          '';
        };
      });
}

