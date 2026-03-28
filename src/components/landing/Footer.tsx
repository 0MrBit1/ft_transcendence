const Footer = () => {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-sm tracking-tight">UniClubs</span>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Help</a>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 UniClubs</p>
      </div>
    </footer>
  );
};

export default Footer;
