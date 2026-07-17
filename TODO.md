# TODO

## Frontend auth + API connectivity fixes
- [x] Update `frontend/src/App.tsx` to validate token on app load (call `/api/auth/me`); on failure clear token and route to `/auth`.

- [x] Update `frontend/src/services/api.ts` to improve API base URL handling and avoid silent localhost failures.

- [x] Run `npm run build` in `frontend/` to ensure no frontend build errors.


## Backend verification
- [ ] Verify Render env vars are used correctly for CORS and JWT settings.
- [x] Run `python -c "from app.main import app"` (backend) to ensure backend imports cleanly.


## Deployment / Push
- [ ] Commit and push changes to frontend git repo.
- [ ] Commit and push changes to backend git repo.
- [ ] Confirm auth page renders correctly at `/auth` in Vercel deployment and login reaches Render backend.

