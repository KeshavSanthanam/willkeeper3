import './globals.css'; // this is the key line

export const metadata = {
  title: 'Willkeeper',
  description: 'Productivity & accountability recorder',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
