import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import './index.css'; // Ensure we use the BMW M styles

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    // Fetch and parse the CSV
    Papa.parse('Combined_All_Questions.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
        setLoading(false);
      }
    });
  }, []);

  // Compute unique companies for the dropdown
  const companies = useMemo(() => {
    const set = new Set();
    data.forEach(item => {
      if (item.Company) set.add(item.Company);
    });
    return Array.from(set).sort();
  }, [data]);

  // Filter the data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = item.Title?.toLowerCase().includes(searchLower) || 
                          item.Topics?.toLowerCase().includes(searchLower) ||
                          item.Company?.toLowerCase().includes(searchLower);
      const matchCompany = companyFilter ? item.Company === companyFilter : true;
      const matchDifficulty = difficultyFilter ? item.Difficulty === difficultyFilter : true;
      
      return matchSearch && matchCompany && matchDifficulty;
    });
  }, [data, searchTerm, companyFilter, difficultyFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Reset to page 1 on filter change
    setCurrentPage(1);
  }, [searchTerm, companyFilter, difficultyFilter]);

  return (
    <>
      {/* Top Nav */}
      <nav className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="display-sm" style={{ fontSize: '24px', letterSpacing: '2px' }}>M</span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="nav-link" 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: 0 
            }}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <a href="#" className="nav-link" style={{ marginLeft: 'auto' }}>LeetCode Collection</a>
        </div>
      </nav>
      <div className="m-stripe-divider"></div>

      {/* Hero Section */}
      <header className="hero-photo-band" style={{ 
        position: 'relative', 
        overflow: 'hidden',
        minHeight: '40vh'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="display-xl">THE ULTIMATE<br/>LEETCODE COLLECTION</h1>
          <p className="body-md mt-xl" style={{ maxWidth: '600px', color: 'var(--body)' }}>
            A curated repository of 14,000+ technical challenges gathered from top-tier engineering teams. Engineered to test precision, logic, and speed.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: 'var(--spacing-section) var(--spacing-xl)' }}>
        
        {/* Filters */}
        <section className="mb-lg" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} color="var(--muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input 
              type="text" 
              className="text-input" 
              placeholder="SEARCH TOPICS, TITLES OR COMPANY..." 
              style={{ paddingLeft: '48px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="text-input" 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="">ALL COMPANIES</option>
            {companies.map(c => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>

          <select 
            className="text-input"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">ALL DIFFICULTIES</option>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </section>

        {/* Results Info */}
        <div className="title-sm mb-lg" style={{ color: 'var(--muted)' }}>
          {loading ? 'LOADING DATA...' : `SHOWING ${filteredData.length} RESULTS`}
        </div>

        {/* Data Table */}
        {!loading && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="label-uppercase">Problem</th>
                  <th className="label-uppercase">Difficulty</th>
                  <th className="label-uppercase">Frequency</th>
                  <th className="label-uppercase">Company</th>
                  <th className="label-uppercase">Topics</th>
                  <th className="label-uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="title-md">{item.Title}</div>
                    </td>
                    <td>
                      <span className={`difficulty-badge label-uppercase ${item.Difficulty?.toLowerCase()}`}>
                        {item.Difficulty}
                      </span>
                    </td>
                    <td><span className="body-sm">{item.Frequency}</span></td>
                    <td><span className="label-uppercase">{item.Company}</span></td>
                    <td><span className="body-sm" style={{ color: 'var(--muted)' }}>{item.Topics}</span></td>
                    <td>
                      <a href={item.Link} target="_blank" rel="noopener noreferrer" className="text-link">
                        SOLVE <ExternalLink size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button 
              className="button-primary" 
              style={{ padding: '0', width: '48px', height: '48px', borderRadius: 'var(--rounded-full)', backgroundColor: 'var(--surface-card)', borderColor: 'transparent' }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </button>
            <span className="label-uppercase">PAGE {currentPage} OF {totalPages}</span>
            <button 
              className="button-primary"
              style={{ padding: '0', width: '48px', height: '48px', borderRadius: 'var(--rounded-full)', backgroundColor: 'var(--surface-card)', borderColor: 'transparent' }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--canvas)', padding: 'var(--spacing-section) var(--spacing-xl)', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-xl)' }}>
          <div>
            <h3 className="label-uppercase mb-lg">PROJECT</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <span className="body-sm" style={{ color: 'var(--muted)' }}>Done by Vatsal</span>
            </div>
          </div>
          <div>
            <h3 className="label-uppercase mb-lg">LEETCODE</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <a href="#" className="body-sm" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Arrays</a>
              <a href="#" className="body-sm" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Dynamic Programming</a>
              <a href="#" className="body-sm" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Graphs</a>
            </div>
          </div>
        </div>
        <div className="caption" style={{ color: 'var(--muted)', marginTop: 'var(--spacing-xxl)' }}>
          © 2026 BMW M DESIGN SYSTEM. NOT AN OFFICIAL BMW PRODUCT. DONE BY VATSAL.
        </div>
      </footer>
    </>
  );
}

export default App;
