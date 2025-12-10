export default function Footer() {
    return (
      <footer className="bg-dark text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* ロゴ */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <span className="text-white font-display text-lg">C</span>
              </div>
              <div>
                <span className="text-xl font-display">CA27</span>
                <span className="text-xl font-display text-primary ml-1">People</span>
              </div>
            </div>
  
            {/* コピーライト */}
            <p className="text-gray-400 text-sm font-body">
              © 2025 CA27 People. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    )
  }