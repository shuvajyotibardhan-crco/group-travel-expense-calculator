# Project State
- **Last Updated:** 2026-05-04
- **Current Branch:** main
- **Current Task:** T17 — Firebase setup and first deploy (IN PROGRESS)

## Completed Actions
1. [x] Stage 1 REQUIREMENTS approved
2. [x] Stage 2 DESIGN approved
3. [x] Stage 3 SPECS approved
4. [x] Stage 4 TASKS approved
5. [x] Vite + React project scaffolded (T01)
6. [x] All source files created: constants, calculations engine, state store, CSV parser/exporter, all 6 components (T04–T15)
7. [x] All docs created: PLAN, REQUIREMENTS, DESIGN, SPECS, TASKS, CLAUDE.md (T16)
8. [x] Git repo initialised and pushed to GitHub
9. [x] Firebase project created: travel-expense-calculato-e6c72
10. [x] Service account JSON obtained
11. [x] FIREBASE_SERVICE_ACCOUNT GitHub secret set
12. [x] firebase.json, .firebaserc, deploy.yml created and pushed

## Current Logic Context
- Firebase Project ID: travel-expense-calculato-e6c72
- GitHub repo: https://github.com/shuvajyotibardhan-crco/group-travel-expense-calculator
- gh CLI binary at: /tmp/gh_amd64/gh_2.62.0_macOS_amd64/bin/gh
- Service account JSON file: travel-expense-calculato-e6c72-firebase-adminsdk-fbsvc-34044e1437.json (in project root — DO NOT COMMIT)
- deploy.yml uses FirebaseExtended/action-hosting-deploy@v0

## Next Immediate Step
- Verify GitHub Actions deploy run passed
- Check live Firebase Hosting URL: https://travel-expense-calculato-e6c72.web.app
- If deploy failed: run `gh run view <run-id> --log-failed` to diagnose
