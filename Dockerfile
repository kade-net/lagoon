FROM node:18-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app 
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=pool --prod /prod/pool
RUN pnpm deploy --filter=trawler --prod /prod/trawler
RUN pnpm deploy --filter=oracle --prod /prod/oracle

FROM base AS oracle
COPY --from=build /prod/oracle /prod/oracle
WORKDIR /prod/oracle
CMD ["pnpm", "migrate"]

FROM base AS pool-init 
COPY --from=build /prod/pool /prod/reader
WORKDIR /prod/reader 
CMD ["pnpm", "db:init"]

FROM base AS pool-reader 
COPY --from=build /prod/pool /prod/reader
WORKDIR /prod/reader 
CMD ["pnpm", "read"]

FROM base AS pool-writer
COPY --from=build /prod/pool /prod/writer 
WORKDIR /prod/writer
CMD ["pnpm", "write"]

FROM base AS trawler
COPY --from=build /prod/trawler /prod/trawler
WORKDIR /prod/trawler
EXPOSE 4000
CMD ["pnpm", "start"]