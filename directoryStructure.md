[ec2-user@ip-10-0-0-47 local]$ tree -x  -I "node_modules|__pycache__"
.
├── backend
│   ├── Dockerfile
│   ├── db.sqlite3
│   ├── error.log
│   ├── general
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── api.py
│   │   ├── apps.py
│   │   ├── migrations
│   │   │   ├── 0001_initial.py
│   │   │   ├── 0002_remove_review_user_event_host_and_more.py
│   │   │   ├── 0003_booking_created_at_alter_booking_event_and_more.py
│   │   │   └── __init__.py
│   │   ├── models.py
│   │   ├── tests.py
│   │   └── views.py
│   ├── manage.py
│   ├── media
│   ├── requirements.txt
│   ├── src
│   │   ├── __init__.py
│   │   ├── api.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── static
├── cleanup.sh
├── data
│   └── db
│       └── db.sqlite3
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── README.md
│   ├── build
│   ├── dist
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── src
│   │   ├── App.tsx
│   │   ├── Router.tsx
│   │   ├── api
│   │   │   └── API.tsx
│   │   ├── auth
│   │   │   └── AuthProvider.tsx
│   │   ├── components
│   │   │   ├── Cards
│   │   │   │   └── Card.tsx
│   │   │   ├── ColorSchemeToggle
│   │   │   │   └── ColorSchemeToggle.tsx
│   │   │   ├── Footer
│   │   │   │   ├── FooterSimple.module.css
│   │   │   │   └── FooterSimple.tsx
│   │   │   ├── NavigationBar
│   │   │   │   ├── NavigationBar.module.css
│   │   │   │   └── NavigationBar.tsx
│   │   │   ├── SingleExperienceView
│   │   │   │   └── SingleExperienceView.tsx
│   │   │   ├── Welcome
│   │   │   │   ├── Welcome.module.css
│   │   │   │   ├── Welcome.story.tsx
│   │   │   │   ├── Welcome.test.tsx
│   │   │   │   └── Welcome.tsx
│   │   │   └── images
│   │   │       ├── logo_circle.png
│   │   │       ├── logo_square.png
│   │   │       └── logo_square_old.png
│   │   ├── favicon.svg
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── AccountSettings.tsx
│   │   │   ├── AccountSettingsHost.tsx
│   │   │   ├── CreateExperience.page.tsx
│   │   │   ├── ExperienceListPaginated.tsx
│   │   │   ├── ExperienceRegistration.page.tsx
│   │   │   ├── Home.page.tsx
│   │   │   ├── Landing.page.tsx
│   │   │   ├── MessagesPage.tsx
│   │   │   ├── NoDataPullExperienceView.tsx
│   │   │   ├── SignIn.page.tsx
│   │   │   ├── SignUp.page.tsx
│   │   │   ├── SingleExperiencePage.tsx
│   │   │   ├── ViewHostProfile.tsx
│   │   │   └── ViewUserProfile.tsx
│   │   ├── theme.ts
│   │   ├── types
│   │   │   └── ExperienceTypes.ts
│   │   └── vite-env.d.ts
│   ├── test-utils
│   │   ├── index.ts
│   │   └── render.tsx
│   ├── tsconfig.json
│   ├── vite.config.mjs
│   ├── vitest.setup.mjs
│   └── yarn.lock
├── nginx
│   ├── default.conf
│   └── nginx.conf
├── package-lock.json
├── package.json
└── readme.md