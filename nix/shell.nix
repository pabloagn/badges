{ pkgs }:

pkgs.mkShell {
  name = "badges-shell";
  buildInputs = with pkgs; [
    nodejs_20 # Node 20.x  (npm included)
    nodePackages.vercel # optional: `vercel` CLI
    git
    claude-code
  ];
  shellHook = ''
    export NODE_ENV=development
    echo "Dev shell ready – run:  npm ci && npm run build"
  '';
}
