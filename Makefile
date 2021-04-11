.PHONY: test cypress

test:
	npm run test

cypress:
	CYPRESS_MAILSLURP_API_KEY=$(API_KEY) npm run cypress