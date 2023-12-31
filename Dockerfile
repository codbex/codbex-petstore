# Docker descriptor for codbex-petstore
# License - http://www.eclipse.org/legal/epl-v20.html

FROM dirigiblelabs/dirigible:latest

COPY codbex-petstore target/dirigible/repository/root/registry/public/codbex-petstore
COPY codbex-petstore-data target/dirigible/repository/root/registry/public/codbex-petstore-data
COPY codbex-petstore-api target/dirigible/repository/root/registry/public/codbex-petstore-api

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-petstore/gen/index.html
