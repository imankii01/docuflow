# DocuFlow - Smart Document Management System

A modern, intelligent document management system built with React and TypeScript, featuring real-time collaboration, smart version control, and secure document handling.

## ✨ Features

- **🔄 Smart Version Control**: Track every change with intelligent version management and easy rollback capabilities
- **💬 Real-time Collaboration**: Comment, review, and collaborate with your team in real-time on any document version
- **🔒 Secure & Private**: Enterprise-grade security with granular permissions and encrypted file storage
- **⚡ Lightning Fast**: Built on modern infrastructure for instant document access and seamless performance
- **👥 Team Management**: Organize teams and manage user permissions efficiently
- **📱 Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **🎨 Modern UI**: Clean, intuitive interface built with Tailwind CSS

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript ESLint

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imankii01/docuflow.git
   cd docuflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## ⚙️ Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Set up the database schema using the migrations in the `supabase/migrations` folder
4. Configure authentication providers as needed

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## 📖 Usage

### Getting Started

1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Upload Documents**: Add your documents to the system
3. **Organize**: Create folders and organize your documents
4. **Collaborate**: Invite team members and start collaborating
5. **Version Control**: Track changes and manage document versions
6. **Review**: Use the comment system for document reviews

### Key Workflows

- **Document Management**: Upload, organize, and manage your documents
- **Version Control**: Track changes, compare versions, and rollback when needed
- **Team Collaboration**: Share documents, assign permissions, and collaborate in real-time
- **Review Process**: Use comments and annotations for document reviews

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Documents/      # Document management components
│   ├── Landing/        # Landing page components
│   ├── Layout/         # Layout components
│   └── Profile/        # User profile components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
└── main.tsx           # Application entry point
```

### Code Style

This project uses ESLint and TypeScript for code quality. Run `npm run lint` to check for issues.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/imankii01/docuflow/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide detailed information about the issue

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

---

Made with ❤️ for better document management
