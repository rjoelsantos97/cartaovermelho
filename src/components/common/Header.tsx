import Link from 'next/link';

interface HeaderProps {
  showCategories?: boolean;
  categories?: Array<{
    id: string;
    name: string;
    active: boolean;
  }>;
}

export function Header({ showCategories = false, categories = [] }: HeaderProps) {
  // Fixed top 7 most common categories based on database analysis
  const topCategories = [
    { id: 'futebol-portugues', name: 'Futebol Português', active: false },
    { id: 'desporto', name: 'Desporto', active: false },
    { id: 'futebol-italiano', name: 'Futebol Italiano', active: false },
    { id: 'transferencias', name: 'Transferências', active: false },
    { id: 'sporting', name: 'Sporting', active: false },
    { id: 'futebol-amador', name: 'Futebol Amador', active: false },
    { id: 'internacional', name: 'Internacional', active: false }
  ];

  const displayCategories = showCategories 
    ? (categories.length > 0 ? categories.slice(0, 7) : topCategories)
    : [];

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-14 bg-red-600 rounded-lg shadow-xl transform rotate-12 hover:rotate-6 transition-transform duration-200">
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900 tracking-tight bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Cartão Vermelho
              </span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sports Drama
              </span>
            </div>
          </Link>
          
          {/* Navigation */}
          {showCategories && (
            <nav className="hidden md:flex items-center gap-6">
              {displayCategories.map((category) => (
                <Link
                  key={category.id}
                  href={category.id === 'all' ? '/' : `/?category=${category.id}`}
                  className={`font-medium hover:text-red-600 transition-colors text-sm ${
                    category.active ? 'text-red-600 font-semibold' : 'text-gray-600'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}