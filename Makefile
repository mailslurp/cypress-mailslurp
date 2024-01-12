.PHONY: test cypress build

fmt:
	npm run lint

build:
	npm run build
	cp src/index.d.ts dist/index.d.ts

cypress:
	CYPRESS_MAILSLURP_API_KEY=$(API_KEY) npm run cypress

cypress-open:
	CYPRESS_MAILSLURP_API_KEY=$(API_KEY) npm run cypress-open

# increment package json then deploy
deploy: build cypress readme
	npm publish

readme: node_modules
	DEBUG=script* npm run readme
