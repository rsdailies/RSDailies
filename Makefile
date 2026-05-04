# RSDailies Build & Development
# Replaced legacy python server with standard Vite pipeline

.PHONY: dev build preview test audit verify

# Start development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Preview production build
preview:
	npm run build && npm run preview

# Run unit tests
test:
	npm test

# Run quality audits
audit:
	npm run audit

# Full verification sweep (Tests, Audits, E2E)
verify:
	npm run verify:full

# Compatibility target for old 'serve'
serve: dev
