.PHONY: test cypress build

fmt:
	npm run lint

build:
	npm run build

cypress:
	npm run cypress

cypress-open:
	npm run cypress-open

# increment package json then deploy
deploy: build cypress readme
	npm publish

readme: node_modules
	DEBUG=script* npm run readme
