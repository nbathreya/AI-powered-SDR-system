import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_URL = 'http://localhost:8001/api';

function App() {
  // State management
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState({});
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [tuneUpInstructions, setTuneUpInstructions] = useState('');
  const [showScoringSettings, setShowScoringSettings] = useState(false);
  const [scoringCriteria, setScoringCriteria] = useState({
    company_size_weight: 0.25,
    job_title_weight: 0.25,
    industry_relevance_weight: 0.25,
    engagement_weight: 0.25
  });
  const [activities, setActivities] = useState([]);
  const [showActivityTimeline, setShowActivityTimeline] = useState(true);
  const [stageFilter, setStageFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    company: '',
    industry: '',
    dateFrom: '',
    dateTo: '',
    minScore: '',
    maxScore: ''
  });

  // Refs
  const messageDisplayRef = useRef(null);
  const sortButtonRef = useRef(null);

  // Get recommended message types based on pipeline stage
  const getRecommendedMessageTypes = (pipelineStage) => {
    const messageOptions = {
      'new': [
        { type: 'initial_outreach', label: 'Initial Outreach', className: 'btn-primary', recommended: true },
        { type: 'value_proposition', label: 'Value Proposition', className: 'btn-purple' },
        { type: 'problem_solution', label: 'Problem-Solution', className: 'btn-green' }
      ],
      'qualified': [
        { type: 'initial_outreach', label: 'Initial Outreach', className: 'btn-primary', recommended: true },
        { type: 'value_proposition', label: 'Value Proposition', className: 'btn-purple' },
        { type: 'problem_solution', label: 'Problem-Solution', className: 'btn-green' }
      ],
      'contacted': [
        { type: 'follow_up', label: 'Follow-up', className: 'btn-primary', recommended: true },
        { type: 'value_proposition', label: 'Value Proposition', className: 'btn-purple' },
        { type: 'meeting_request', label: 'Meeting Request', className: 'btn-green' }
      ],
      'meeting': [
        { type: 'meeting_request', label: 'Meeting Confirmation', className: 'btn-primary', recommended: true },
        { type: 'value_proposition', label: 'Pre-Meeting Info', className: 'btn-purple' },
        { type: 'follow_up', label: 'Meeting Follow-up', className: 'btn-green' }
      ],
      'negotiation': [
        { type: 'value_proposition', label: 'Value Summary', className: 'btn-primary', recommended: true },
        { type: 'follow_up', label: 'Negotiation Follow-up', className: 'btn-purple' },
        { type: 'problem_solution', label: 'Address Concerns', className: 'btn-green' }
      ],
      'closed_won': [
        { type: 'casual_check_in', label: 'Thank You Note', className: 'btn-primary', recommended: true },
        { type: 'follow_up', label: 'Onboarding Check-in', className: 'btn-purple' },
        { type: 'value_proposition', label: 'Success Story', className: 'btn-green' }
      ],
      'closed_lost': [
        { type: 'casual_check_in', label: 'Stay in Touch', className: 'btn-primary', recommended: true },
        { type: 'follow_up', label: 'Re-engagement', className: 'btn-purple' },
        { type: 'value_proposition', label: 'New Value Prop', className: 'btn-green' }
      ]
    };

    return messageOptions[pipelineStage] || messageOptions['new'];
  };

  // Load initial data
  useEffect(() => {
    fetchLeads();
    fetchPipelineStats();
  }, []);

  // Close message box when a different lead is selected
  useEffect(() => {
    if (generatedMessage) {
      // When a different lead is selected and message box is open, close it
      setGeneratedMessage(null);
    }
  }, [selectedLead?.id]); // Only trigger when selectedLead ID changes

  // Click away listener for sort menu
  useEffect(() => {
    const handleClickAway = (e) => {
      if (showSortMenu && !e.target.closest('.sort-menu') && !e.target.closest('.btn-icon-sort')) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('click', handleClickAway);
      return () => document.removeEventListener('click', handleClickAway);
    }
  }, [showSortMenu]);

  // Toast notification helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  // API Functions
  const fetchLeads = async () => {
    try {
      const response = await fetch(`${API_URL}/leads`);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      addToast('Failed to fetch leads', 'error');
    }
  };

  const fetchPipelineStats = async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/pipeline`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivities = async (leadId) => {
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}/activities`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  };

  const createLead = async (leadData) => {
    setLoading(true);
    setLoadingMessage('Creating new lead...');
    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create lead');
      }

      const newLead = await response.json();
      setLeads(prev => [...prev, newLead]);
      setShowAddLeadModal(false);
      addToast('Lead created successfully!');
      fetchPipelineStats();
    } catch (error) {
      console.error('Error creating lead:', error);
      addToast(error.message || 'Failed to create lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (leadId, leadData) => {
    setLoading(true);
    setLoadingMessage('Updating lead...');
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update lead');
      }

      const updatedLead = await response.json();
      setLeads(prev => prev.map(lead => lead.id === leadId ? updatedLead : lead));
      setSelectedLead(updatedLead);
      setShowEditLeadModal(false);
      addToast('Lead updated successfully!');
      fetchPipelineStats();
    } catch (error) {
      console.error('Error updating lead:', error);
      addToast(error.message || 'Failed to update lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (leadId) => {
    setLoading(true);
    setLoadingMessage('Deleting lead...');
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete lead');
      }

      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      setSelectedLead(null);
      setShowDeleteConfirm(false);
      addToast('Lead deleted successfully!');
      fetchPipelineStats();
    } catch (error) {
      console.error('Error deleting lead:', error);
      addToast(error.message || 'Failed to delete lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteMultipleLeads = async () => {
    setLoading(true);
    setLoadingMessage(`Deleting ${selectedLeads.size} leads...`);
    try {
      const deletePromises = Array.from(selectedLeads).map(leadId =>
        fetch(`${API_URL}/leads/${leadId}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      setLeads(prev => prev.filter(lead => !selectedLeads.has(lead.id)));
      setSelectedLeads(new Set());
      setSelectedLead(null);
      setShowDeleteConfirm(false);
      addToast(`Successfully deleted ${selectedLeads.size} leads!`);
      fetchPipelineStats();
    } catch (error) {
      console.error('Error deleting leads:', error);
      addToast('Failed to delete some leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const filterAndSortLeads = (leadsToSort) => {
    let filtered = leadsToSort;

    // Filter by stage if active
    if (stageFilter) {
      filtered = filtered.filter(lead => lead.pipeline_stage === stageFilter);
    }

    // Filter by search query (full-text search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => {
        return (
          lead.first_name?.toLowerCase().includes(query) ||
          lead.last_name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query) ||
          lead.job_title?.toLowerCase().includes(query) ||
          lead.industry?.toLowerCase().includes(query) ||
          lead.notes?.toLowerCase().includes(query)
        );
      });
    }

    // Apply advanced filters
    if (advancedFilters.company) {
      const companyQuery = advancedFilters.company.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.company?.toLowerCase().includes(companyQuery)
      );
    }

    if (advancedFilters.industry) {
      const industryQuery = advancedFilters.industry.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.industry?.toLowerCase().includes(industryQuery)
      );
    }

    if (advancedFilters.dateFrom) {
      const fromDate = new Date(advancedFilters.dateFrom);
      filtered = filtered.filter(lead =>
        new Date(lead.created_at) >= fromDate
      );
    }

    if (advancedFilters.dateTo) {
      const toDate = new Date(advancedFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(lead =>
        new Date(lead.created_at) <= toDate
      );
    }

    if (advancedFilters.minScore !== '') {
      const minScore = parseFloat(advancedFilters.minScore);
      filtered = filtered.filter(lead =>
        lead.score >= minScore
      );
    }

    if (advancedFilters.maxScore !== '') {
      const maxScore = parseFloat(advancedFilters.maxScore);
      filtered = filtered.filter(lead =>
        lead.score <= maxScore
      );
    }

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'pipeline_stage') {
        // Define logical pipeline stage order
        const stageOrder = {
          'new': 1,
          'qualified': 2,
          'contacted': 3,
          'meeting': 4,
          'negotiation': 5,
          'closed_won': 6,
          'closed_lost': 7
        };
        aVal = stageOrder[a.pipeline_stage] || 0;
        bVal = stageOrder[b.pipeline_stage] || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const handleStageFilterClick = (stage) => {
    if (stageFilter === stage) {
      // If clicking the same filter, toggle it off
      setStageFilter(null);
    } else {
      // Otherwise, set the new filter
      setStageFilter(stage);
    }
  };

  const scoreAllLeads = async () => {
    setLoading(true);
    setLoadingMessage('Analyzing and scoring all leads with Grok AI...');

    try {
      const response = await fetch(`${API_URL}/leads/score-batch`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to score leads');

      await response.json();

      // Refresh leads list
      await fetchLeads();

      // Refresh selected lead if one is selected
      if (selectedLead) {
        const updatedLeadResponse = await fetch(`${API_URL}/leads/${selectedLead.id}`);
        if (updatedLeadResponse.ok) {
          const updatedLead = await updatedLeadResponse.json();
          setSelectedLead(updatedLead);
        }
      }

      addToast('Successfully scored all leads!');
    } catch (error) {
      console.error('Error scoring leads:', error);
      addToast('Failed to score leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = async (leadId, messageType) => {
    setLoading(true);
    setLoadingMessage(`Generating personalized ${messageType.replace('_', ' ')}...`);

    try {
      const response = await fetch(`${API_URL}/leads/${leadId}/generate-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_type: messageType })
      });

      if (!response.ok) throw new Error('Failed to generate message');

      const message = await response.json();
      setGeneratedMessage({ ...message, type: messageType });

      // Refresh the selected lead to get updated pipeline stage
      const updatedLeadResponse = await fetch(`${API_URL}/leads/${leadId}`);
      if (updatedLeadResponse.ok) {
        const updatedLead = await updatedLeadResponse.json();
        setSelectedLead(updatedLead);
        setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
      }

      // Refresh pipeline stats and activities
      fetchPipelineStats();
      if (selectedLead?.id === leadId) {
        fetchActivities(leadId);
      }

      // Use instant scroll instead of smooth for better performance
      setTimeout(() => {
        messageDisplayRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, 50);

      addToast('Message generated successfully!');
    } catch (error) {
      console.error('Error generating message:', error);
      addToast('Failed to generate message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tuneUpMessage = async () => {
    if (!tuneUpInstructions.trim()) {
      addToast('Please provide tune-up instructions', 'warning');
      return;
    }

    setLoading(true);
    setLoadingMessage('Tuning up message based on your feedback...');

    try {
      const response = await fetch(`${API_URL}/leads/${selectedLead.id}/tune-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_message: generatedMessage.content,
          message_type: generatedMessage.type,
          instructions: tuneUpInstructions
        })
      });

      if (!response.ok) throw new Error('Failed to tune up message');

      const tunedMessage = await response.json();
      setGeneratedMessage({ ...tunedMessage, type: generatedMessage.type });
      setTuneUpInstructions('');

      // Refresh activities
      if (selectedLead?.id) {
        fetchActivities(selectedLead.id);
      }

      addToast('Message tuned up successfully!');
    } catch (error) {
      console.error('Error tuning up message:', error);
      addToast('Failed to tune up message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStage = async (leadId, newStage) => {
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });

      if (!response.ok) throw new Error('Failed to update stage');

      await response.json();

      // Update the lead in local state
      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, pipeline_stage: newStage } : lead
      ));

      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, pipeline_stage: newStage });
        fetchActivities(leadId);
      }

      fetchPipelineStats();
      addToast('Stage updated!');
    } catch (error) {
      console.error('Error updating stage:', error);
      addToast('Failed to update stage', 'error');
    }
  };

  // Helper function for score colors
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#84cc16';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>Grok SDR System</h1>
            <p>AI-Powered Sales Development Platform</p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="main-container">
        {/* Action Bar */}
        <div className="action-bar">
          <button onClick={() => setShowAddLeadModal(true)} className="btn btn-primary">
            + Add Lead
          </button>
          <button onClick={scoreAllLeads} className="btn btn-purple" disabled={leads.length === 0}>
            ⚡ Score All Leads
          </button>
          <button onClick={() => setShowScoringSettings(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Scoring Settings
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            ↻ Refresh
          </button>
        </div>

        {/* Pipeline Stats */}
        {leads.length > 0 && Array.isArray(stats) && stats.length > 0 && (
          <div className="pipeline-stats">
            {stageFilter && (
              <div
                className="stat-card stat-card-show-all"
                onClick={() => setStageFilter(null)}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-label">Show All</div>
                <div className="stat-count">{leads.length}</div>
                <div className="stat-avg">Clear Filter</div>
              </div>
            )}
            {stats.map((stat) => (
              <div
                key={stat.stage}
                className={`stat-card ${stageFilter === stat.stage ? 'stat-card-active' : ''}`}
                onClick={() => handleStageFilterClick(stat.stage)}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-label">{stat.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div className="stat-count">{stat.count || 0}</div>
                {stat.avg_score > 0 && (
                  <div className="stat-avg">Avg Score: {stat.avg_score.toFixed(1)}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Leads List */}
            <div className="leads-section">
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2>
                      Leads ({filterAndSortLeads(leads).length}
                      {stageFilter && <span style={{ color: '#14b8a6', fontWeight: 'normal', fontSize: '0.9rem' }}> / {leads.length}</span>})
                    </h2>
                    {selectedLeads.size > 0 && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn-icon-delete"
                        title="Delete selected leads"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        ({selectedLeads.size})
                      </button>
                    )}
                  </div>
                  <div>
                    <button
                      ref={sortButtonRef}
                      onClick={(e) => {
                        const newShowState = !showSortMenu;
                        setShowSortMenu(newShowState);

                        if (newShowState) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTimeout(() => {
                            const menu = document.querySelector('.sort-menu');
                            if (menu) {
                              menu.style.top = `${rect.bottom + 8}px`;
                              menu.style.right = `${window.innerWidth - rect.right}px`;
                            }
                          }, 0);
                        }
                      }}
                      className="btn-icon-sort"
                      title="Sort leads"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M7 12h10m-7 6h4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="search-filters-section">
                  <div className="search-bar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search leads by name, email, company, industry..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    {(searchQuery || Object.values(advancedFilters).some(v => v !== '')) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setAdvancedFilters({
                            company: '',
                            industry: '',
                            dateFrom: '',
                            dateTo: '',
                            minScore: '',
                            maxScore: ''
                          });
                        }}
                        className="clear-search-btn"
                        title="Clear all filters"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={`advanced-filter-btn ${showAdvancedFilters ? 'active' : ''}`}
                      title="Advanced filters"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                    </button>
                  </div>

                  {showAdvancedFilters && (
                    <div className="advanced-filters">
                      <div className="filter-row">
                        <div className="filter-group">
                          <label>Company</label>
                          <input
                            type="text"
                            placeholder="Filter by company..."
                            value={advancedFilters.company}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, company: e.target.value})}
                            className="filter-input"
                          />
                        </div>
                        <div className="filter-group">
                          <label>Industry</label>
                          <input
                            type="text"
                            placeholder="Filter by industry..."
                            value={advancedFilters.industry}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, industry: e.target.value})}
                            className="filter-input"
                          />
                        </div>
                      </div>
                      <div className="filter-row">
                        <div className="filter-group">
                          <label>Date From</label>
                          <input
                            type="date"
                            value={advancedFilters.dateFrom}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                            className="filter-input"
                          />
                        </div>
                        <div className="filter-group">
                          <label>Date To</label>
                          <input
                            type="date"
                            value={advancedFilters.dateTo}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                            className="filter-input"
                          />
                        </div>
                      </div>
                      <div className="filter-row">
                        <div className="filter-group">
                          <label>Min Score</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={advancedFilters.minScore}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, minScore: e.target.value})}
                            className="filter-input"
                          />
                        </div>
                        <div className="filter-group">
                          <label>Max Score</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="100"
                            value={advancedFilters.maxScore}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, maxScore: e.target.value})}
                            className="filter-input"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-body">
                  {leads.length === 0 ? (
                    <div className="empty-state">
                      <p>No leads yet. Add your first lead to get started!</p>
                    </div>
                  ) : filterAndSortLeads(leads).length === 0 ? (
                    <div className="empty-state">
                      <p>No leads match your search criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setAdvancedFilters({
                            company: '',
                            industry: '',
                            dateFrom: '',
                            dateTo: '',
                            minScore: '',
                            maxScore: ''
                          });
                          setStageFilter(null);
                        }}
                        className="btn btn-secondary"
                        style={{ marginTop: '1rem' }}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="leads-list">
                      {filterAndSortLeads(leads).map(lead => (
                        <div
                          key={lead.id}
                          className={`lead-item ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedLead(lead);
                            fetchActivities(lead.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLeads.has(lead.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleLeadSelection(lead.id);
                            }}
                            className="lead-checkbox"
                          />
                          <div className="lead-info">
                            <div className="lead-header">
                              <h3>{lead.first_name} {lead.last_name}</h3>
                              {lead.score !== null && (
                                <span
                                  className="score-badge"
                                  style={{
                                    backgroundColor: getScoreColor(lead.score)
                                  }}
                                >
                                  {lead.score}
                                </span>
                              )}
                            </div>
                            <p className="lead-title">{lead.job_title} at {lead.company}</p>
                            <p className="lead-email">{lead.email}</p>
                          </div>
                          <select
                            value={lead.pipeline_stage}
                            onChange={(e) => updateLeadStage(lead.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="stage-select"
                          >
                            <option value="new">New</option>
                            <option value="qualified">Qualified</option>
                            <option value="contacted">Contacted</option>
                            <option value="meeting">Meeting</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="closed_won">Closed Won</option>
                            <option value="closed_lost">Closed Lost</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div className="details-section">
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Lead Details</h2>
                  {selectedLead && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setShowEditLeadModal(true)} className="btn-icon-edit" title="Edit lead">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  {selectedLead ? (
                    <>
                      <div className="detail-group">
                        <label>Name</label>
                        <p>{selectedLead.first_name} {selectedLead.last_name}</p>
                      </div>
                      <div className="detail-group">
                        <label>Email</label>
                        <p>{selectedLead.email}</p>
                      </div>
                      <div className="detail-group">
                        <label>Company</label>
                        <p>{selectedLead.company} ({selectedLead.company_size})</p>
                      </div>
                      <div className="detail-group">
                        <label>Position</label>
                        <p>{selectedLead.job_title}</p>
                      </div>
                      <div className="detail-group">
                        <label>Industry</label>
                        <p>{selectedLead.industry}</p>
                      </div>

                      {selectedLead.score !== null && (
                        <div className="detail-group">
                          <label>Qualification Score</label>
                          <div className="score-section">
                            <span
                              className="score-large"
                              style={{ backgroundColor: getScoreColor(selectedLead.score) }}
                            >
                              {selectedLead.score}
                            </span>
                          </div>
                          {selectedLead.score_reasoning && (
                            <p className="reasoning">{selectedLead.score_reasoning}</p>
                          )}
                        </div>
                      )}

                      {/* Activity Timeline */}
                      <div className="activity-timeline-section">
                        <div className="activity-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h3 style={{ margin: 0 }}>Activity Timeline</h3>
                          <button
                            onClick={() => setShowActivityTimeline(!showActivityTimeline)}
                            className="btn-icon-sort"
                            title={showActivityTimeline ? "Hide timeline" : "Show timeline"}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {showActivityTimeline ? (
                                <path d="M19 9l-7 7-7-7" />
                              ) : (
                                <path d="M9 18l6-6-6-6" />
                              )}
                            </svg>
                          </button>
                        </div>

                        {showActivityTimeline && (
                          <div className="activity-timeline">
                            {activities.length === 0 ? (
                              <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                                No activity recorded yet
                              </p>
                            ) : (
                              activities.map((activity, index) => (
                                <div key={activity.id} className="activity-item">
                                  <div className="activity-icon">
                                    {activity.activity_type === 'lead_created' && (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8z" />
                                      </svg>
                                    )}
                                    {activity.activity_type === 'lead_scored' && (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    )}
                                    {activity.activity_type === 'message_generated' && (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                      </svg>
                                    )}
                                    {activity.activity_type === 'message_tuned' && (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    )}
                                    {activity.activity_type === 'stage_change' && (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                      </svg>
                                    )}
                                    {activity.activity_type === 'auto_stage_change' && (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                      </svg>
                                    )}
                                    {activity.activity_type === 'lead_deleted' && (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="activity-content">
                                    <p className="activity-description">{activity.description}</p>
                                    {activity.notes && (
                                      <p className="activity-notes">{activity.notes}</p>
                                    )}
                                    <span className="activity-timestamp">
                                      {new Date(activity.timestamp).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  </div>
                                  {index < activities.length - 1 && <div className="activity-line"></div>}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      <div className="message-actions">
                        <h3>Generate Personalized Message</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                          Recommended for <strong>{selectedLead.pipeline_stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> stage
                        </p>
                        {getRecommendedMessageTypes(selectedLead.pipeline_stage).map((option, index) => (
                          <button
                            key={index}
                            onClick={() => generateMessage(selectedLead.id, option.type)}
                            className={`btn ${option.className} btn-full`}
                            style={option.recommended ? {
                              boxShadow: '0 0 0 2px rgba(20, 184, 166, 0.3)',
                              fontWeight: '600'
                            } : {}}
                          >
                            {option.recommended && '⭐ '}{option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">
                      <p>Select a lead to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Message Display */}
          {generatedMessage && (
            <div className="message-display" ref={messageDisplayRef}>
              <div className="message-header">
                <h3>Generated {generatedMessage.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Message'}</h3>
                <button className="close-btn" onClick={() => setGeneratedMessage(null)}>×</button>
              </div>
              <div className="message-container">
                <div className="message-main">
                  <div className="message-field">
                    <label>Subject:</label>
                    <div className="message-subject">{generatedMessage.subject}</div>
                  </div>
                  <div className="message-field">
                    <label>Message:</label>
                    <div className="message-body">{generatedMessage.content}</div>
                  </div>
                </div>

                <div className="message-sidebar">
                  <div className="tune-up-section">
                    <h4>✨ Tune Up Message</h4>
                    <textarea
                      value={tuneUpInstructions}
                      onChange={(e) => setTuneUpInstructions(e.target.value)}
                      placeholder="Enter instructions for revision (e.g., 'Make it more formal', 'Add focus on ROI', 'Shorten to 3 paragraphs')..."
                      className="tune-up-textarea"
                      rows="4"
                    />
                    <button
                      onClick={tuneUpMessage}
                      className="btn btn-primary btn-full"
                      disabled={!tuneUpInstructions.trim()}
                    >
                      Tune Up Message
                    </button>
                  </div>

                  <div className="action-buttons-section">
                    <h4>Generate Alternative Version:</h4>
                    <div className="action-buttons">
                      {getRecommendedMessageTypes(selectedLead.pipeline_stage).map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setGeneratedMessage(null);
                            generateMessage(selectedLead.id, option.type);
                          }}
                          className={`btn ${option.className}`}
                          style={option.recommended ? {
                            boxShadow: '0 0 0 2px rgba(20, 184, 166, 0.3)',
                            fontWeight: '600'
                          } : {}}
                        >
                          {option.recommended && '⭐ '}{option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Lead</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              createLead(Object.fromEntries(formData));
            }}>
              <input name="first_name" placeholder="First Name" required />
              <input name="last_name" placeholder="Last Name" required />
              <input name="email" type="email" placeholder="Email" required />
              <input name="phone" placeholder="Phone (optional)" />
              <input name="company" placeholder="Company" required />
              <select name="company_size" required>
                <option value="">Select Company Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
              <input name="job_title" placeholder="Job Title" required />
              <select name="industry" required>
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
              <input name="linkedin_url" placeholder="LinkedIn URL (optional)" />
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Add Lead
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditLeadModal && selectedLead && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Lead</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              updateLead(selectedLead.id, Object.fromEntries(formData));
            }}>
              <input name="first_name" placeholder="First Name" defaultValue={selectedLead.first_name} required />
              <input name="last_name" placeholder="Last Name" defaultValue={selectedLead.last_name} required />
              <input name="email" type="email" placeholder="Email" defaultValue={selectedLead.email} required />
              <input name="phone" placeholder="Phone (optional)" defaultValue={selectedLead.phone || ''} />
              <input name="company" placeholder="Company" defaultValue={selectedLead.company || ''} required />
              <select name="company_size" defaultValue={selectedLead.company_size || ''} required>
                <option value="">Select Company Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
              <input name="job_title" placeholder="Job Title" defaultValue={selectedLead.job_title || ''} required />
              <select name="industry" defaultValue={selectedLead.industry || ''} required>
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
              <input name="linkedin_url" placeholder="LinkedIn URL (optional)" defaultValue={selectedLead.linkedin_url || ''} />
              <input name="location" placeholder="Location (optional)" defaultValue={selectedLead.location || ''} />
              <input name="website" placeholder="Website (optional)" defaultValue={selectedLead.website || ''} />
              <textarea name="notes" placeholder="Notes (optional)" rows="3" defaultValue={selectedLead.notes || ''} style={{ resize: 'vertical', fontFamily: 'inherit', padding: '0.75rem', marginBottom: '1rem', border: '2px solid #e2e8f0', borderRadius: '10px', width: '100%' }} />
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Update Lead
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditLeadModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scoring Settings Modal */}
      {showScoringSettings && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '550px' }}>
            <h2 style={{ color: '#14b8a6', marginBottom: '1rem' }}>⚙️ Scoring Criteria Settings</h2>
            <p style={{ marginBottom: '1.5rem', color: '#64748b', fontSize: '0.95rem' }}>
              Adjust the importance of each factor when scoring leads. All weights must total 100%.
            </p>

            <div className="scoring-sliders">
              <div className="scoring-slider-group">
                <label>
                  Company Size Importance
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(scoringCriteria.company_size_weight * 100)}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setScoringCriteria({...scoringCriteria, company_size_weight: val / 100});
                    }}
                    className="weight-input"
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scoringCriteria.company_size_weight * 100}
                  onChange={(e) => setScoringCriteria({...scoringCriteria, company_size_weight: e.target.value / 100})}
                  className="scoring-slider"
                />
              </div>

              <div className="scoring-slider-group">
                <label>
                  Job Title Importance
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(scoringCriteria.job_title_weight * 100)}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setScoringCriteria({...scoringCriteria, job_title_weight: val / 100});
                    }}
                    className="weight-input"
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scoringCriteria.job_title_weight * 100}
                  onChange={(e) => setScoringCriteria({...scoringCriteria, job_title_weight: e.target.value / 100})}
                  className="scoring-slider"
                />
              </div>

              <div className="scoring-slider-group">
                <label>
                  Industry Relevance
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(scoringCriteria.industry_relevance_weight * 100)}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setScoringCriteria({...scoringCriteria, industry_relevance_weight: val / 100});
                    }}
                    className="weight-input"
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scoringCriteria.industry_relevance_weight * 100}
                  onChange={(e) => setScoringCriteria({...scoringCriteria, industry_relevance_weight: e.target.value / 100})}
                  className="scoring-slider"
                />
              </div>

              <div className="scoring-slider-group">
                <label>
                  Engagement Level
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(scoringCriteria.engagement_weight * 100)}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setScoringCriteria({...scoringCriteria, engagement_weight: val / 100});
                    }}
                    className="weight-input"
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scoringCriteria.engagement_weight * 100}
                  onChange={(e) => setScoringCriteria({...scoringCriteria, engagement_weight: e.target.value / 100})}
                  className="scoring-slider"
                />
              </div>

              <div className="total-weight" style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: Math.abs((scoringCriteria.company_size_weight + scoringCriteria.job_title_weight + scoringCriteria.industry_relevance_weight + scoringCriteria.engagement_weight) - 1) < 0.01 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                Total: {Math.round((scoringCriteria.company_size_weight + scoringCriteria.job_title_weight + scoringCriteria.industry_relevance_weight + scoringCriteria.engagement_weight) * 100)}%
                {Math.abs((scoringCriteria.company_size_weight + scoringCriteria.job_title_weight + scoringCriteria.industry_relevance_weight + scoringCriteria.engagement_weight) - 1) >= 0.01 && (
                  <span style={{ color: '#ef4444', display: 'block', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    ⚠️ Must equal 100%
                  </span>
                )}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => {
                  const total = scoringCriteria.company_size_weight + scoringCriteria.job_title_weight + scoringCriteria.industry_relevance_weight + scoringCriteria.engagement_weight;
                  if (Math.abs(total - 1) < 0.01) {
                    setShowScoringSettings(false);
                    addToast('Scoring criteria updated successfully!');
                  } else {
                    addToast('Total weight must equal 100%', 'error');
                  }
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Save Settings
              </button>
              <button
                onClick={() => {
                  setScoringCriteria({
                    company_size_weight: 0.25,
                    job_title_weight: 0.25,
                    industry_relevance_weight: 0.25,
                    engagement_weight: 0.25
                  });
                  setShowScoringSettings(false);
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (selectedLead || selectedLeads.size > 0) && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <h2 style={{ color: '#14b8a6', marginBottom: '1rem' }}>⚠️ Confirm Delete</h2>
            <p style={{ marginBottom: '1.5rem', color: '#475569', fontSize: '1rem' }}>
              {selectedLeads.size > 0 ? (
                <>Are you sure you want to delete <strong>{selectedLeads.size} selected lead{selectedLeads.size > 1 ? 's' : ''}</strong>?</>
              ) : (
                <>Are you sure you want to delete <strong>{selectedLead.first_name} {selectedLead.last_name}</strong>?</>
              )}
            </p>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b', background: 'rgba(241, 245, 249, 0.8)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #a78bfa' }}>
              💡 This will soft delete the lead{selectedLeads.size > 1 ? 's' : ''}. They can be restored later from the audit trail.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => selectedLeads.size > 0 ? deleteMultipleLeads() : deleteLead(selectedLead.id)}
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="loading-message">{loadingMessage}</div>
        </div>
      )}

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <div className="sort-menu">
          <div className="sort-option" onClick={() => { setSortBy('created_at'); setSortOrder('desc'); setShowSortMenu(false); }}>
            Newest First
          </div>
          <div className="sort-option" onClick={() => { setSortBy('created_at'); setSortOrder('asc'); setShowSortMenu(false); }}>
            Oldest First
          </div>
          <div className="sort-option" onClick={() => { setSortBy('score'); setSortOrder('desc'); setShowSortMenu(false); }}>
            Highest Score
          </div>
          <div className="sort-option" onClick={() => { setSortBy('score'); setSortOrder('asc'); setShowSortMenu(false); }}>
            Lowest Score
          </div>
          <div className="sort-option" onClick={() => { setSortBy('pipeline_stage'); setSortOrder('asc'); setShowSortMenu(false); }}>
            Stage (Pipeline Order)
          </div>
          <div className="sort-option" onClick={() => { setSortBy('first_name'); setSortOrder('asc'); setShowSortMenu(false); }}>
            Name (A-Z)
          </div>
          <div className="sort-option" onClick={() => { setSortBy('company'); setSortOrder('asc'); setShowSortMenu(false); }}>
            Company (A-Z)
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' :
                toast.type === 'error' ? '✕' :
                  toast.type === 'warning' ? '!' : 'i'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;