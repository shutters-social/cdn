FROM rockylinux/rockylinux:9-ubi-micro AS build

COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /build

COPY package.json bun.lock ./
RUN /usr/local/bin/bun install --frozen-lockfile

COPY src src
RUN /usr/local/bin/bun run build

FROM rockylinux/rockylinux:9-ubi-micro AS run

COPY --from=build /build/dist/cdn /usr/bin/cdn

ARG vcs_ref
LABEL org.label-schema.vcs-ref=$vcs_ref \
  org.label-schema.vcs-url="CHANGEME" \
  SERVICE_TAGS=$vcs_ref
ENV APP_REVISION ${vcs_ref}

CMD [ "/usr/local/bin/cdn" ]
