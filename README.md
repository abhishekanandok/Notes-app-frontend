# Notes App Frontend

A collaborative notes application built with Next.js, featuring real-time editing, dark mode, and a clean minimal UI.

## Features

- 🔐 **Authentication**: Login and signup with JWT tokens
- 📝 **Collaborative Editing**: Real-time note editing via WebSocket
- 📁 **Folder Management**: Organize notes in folders
- 🔍 **Search**: Search across all notes by title and content
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive**: Works on desktop and mobile devices
- ⚡ **Real-time**: Live updates when multiple users edit the same note

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode
- **Real-time**: WebSocket for collaborative editing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running (for authentication and data)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notes-app-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── notes/[id]/       # Individual note editor
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (redirects)
│   └── providers.tsx     # Theme provider
├── components/           # Reusable components
│   ├── Navbar.tsx       # Navigation with dark mode toggle
│   ├── FolderList.tsx   # Collapsible folder sidebar
│   ├── NoteList.tsx     # Notes grid/list view
│   ├── NoteEditor.tsx   # Collaborative text editor
│   └── SearchBar.tsx    # Search input component
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── NotesContext.tsx # Notes and folders state
└── middleware.ts        # Route protection middleware
```

## API Integration

The app expects the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify` - Token verification

### Notes & Folders
- `GET /api/folders` - Get user folders
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note content

### WebSocket
- `ws://localhost:8000/ws/notes/:id?token=:token` - Real-time collaboration

## Key Features Implementation

### Authentication Flow
1. User logs in/signs up
2. JWT token stored in localStorage
3. Token verified on app load
4. Protected routes redirect to login if no valid token

### Real-time Collaboration
1. WebSocket connection established when entering note editor
2. Changes debounced and sent to server
3. Incoming changes update editor content
4. Connection status shown to user

### Dark Mode
1. next-themes handles theme persistence
2. System preference detection
3. Smooth transitions between themes

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm start
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=your-backend-api-url
NEXT_PUBLIC_WS_URL=your-websocket-url
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.