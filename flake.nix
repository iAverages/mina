{
  description = "A prisma test project";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShell = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodePackages.prisma
        ];
        shellHook = with pkgs; ''
          echo "Adding prisma engines to env ${prisma-engines}"
          export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine";
          export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine";
          export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
          export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
        '';
      };
    });
}
