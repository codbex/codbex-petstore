# Docker descriptor for codbex-petstore
# License - http://www.eclipse.org/legal/epl-v20.html

FROM ghcr.io/codbex/codbex-atlas:latest

COPY codbex-petstore target/dirigible/repository/root/registry/public/codbex-petstore
COPY codbex-petstore-data target/dirigible/repository/root/registry/public/codbex-petstore-data

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-petstore/gen/index.html
