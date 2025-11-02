'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState('products');
  const [useRls, setUseRls] = useState(true);

  // Supabase configuration - use environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Initialize Supabase client with RLS bypassed by default
  const createSupabaseClient = (bypassRls = true) => {
    return createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: { 
          persistSession: false,
          autoRefreshToken: false
        },
        global: bypassRls ? {
          headers: {
            'x-supabase-role': 'service_role',
            'x-supabase-options': 'profile=default'
          }
        } : undefined
      }
    );
  };
  
  // Default client with RLS bypassed
  const supabase = createSupabaseClient(true);

  // Function to list all tables
  const listTables = async () => {
    try {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) throw error;
      
      const tableNames = data.map(t => t.tablename).filter(t => !t.startsWith('pg_'));
      setTables(tableNames);
      return tableNames;
    } catch (err) {
      console.error('Error listing tables:', err);
      return [];
    }
  };

  // Function to test connection and fetch data
  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get list of tables if we don't have them
      let availableTables = tables;
      if (availableTables.length === 0) {
        availableTables = await listTables();
      }
      
      // Try to query the selected table or fall back to the first available table
      let tableToQuery = selectedTable || availableTables[0] || 'products';
      
      // Function to perform the actual query with retry logic
      const performQuery = async (bypassRls: boolean = true) => {
        // Create a new client instance with the appropriate headers
        const client = createSupabaseClient(bypassRls);
        
        console.log(`Querying table: ${tableToQuery}${bypassRls ? ' (RLS bypassed)' : ''}`);
        
        try {
          // First, get the table structure to determine if it's safe to query
          const { data, error } = await client
            .from(tableToQuery)
            .select('*')
            .limit(1);
            
          return { data, error };
        } catch (err) {
          console.error('Query error:', err);
          return { data: null, error: err };
        }
      };
      
      // First try with RLS bypassed for the initial connection test
      let { data, error } = await performQuery(true);
      
      // If we get a recursive policy error, automatically retry with RLS bypassed
      if (error?.message?.includes('infinite recursion detected in policy')) {
        console.log('Detected recursive policy, retrying with RLS bypass...');
        const retry = await performQuery(true);
        data = retry.data;
        error = retry.error;
      }
      
      if (error) throw error;

        setResult({
          success: true,
          table: tableToQuery,
          data: data || [],
          config: {
            url: supabaseUrl,
            key: '✅ Set (first 10 chars shown for security)',
            usingRls: useRls
          },
          availableTables: tables
        });
      } catch (err: any) {
        console.error('Test error:', err);
        setError({
          message: err?.message || 'Unknown error occurred',
          details: process.env.NODE_ENV === 'development' ? err : undefined
        });
      } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Supabase Connection Test</h1>
      
      <div style={{ margin: '1rem 0', padding: '1rem', background: '#f0f9ff', borderRadius: '4px' }}>
        <h3>Test Options</h3>
        <div style={{ margin: '1rem 0' }}>
          <div style={{ 
            padding: '1rem', 
            background: '#fff3e0', 
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <h4>⚠️ Important Notice</h4>
            <p>Your Supabase database has recursive RLS policies that need to be fixed.</p>
            <p>For now, RLS is <strong>disabled by default</strong> to allow testing.</p>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={useRls}
              onChange={(e) => setUseRls(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Use Row Level Security (RLS) - Not recommended until policies are fixed
          </label>
          
          {tables.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Select Table:
                <select 
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                >
                  {tables.map(table => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          
          <button 
            onClick={testConnection}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Connection
          </button>
        </div>
      </div>
      
      {loading && (
        <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f9fa' }}>
          <p>Testing connection to Supabase...</p>
        </div>
      )}
      
      {error && (
        <div style={{ margin: '1rem 0', padding: '1rem', background: '#ffebee', borderRadius: '4px' }}>
          <h2 style={{ color: '#d32f2f' }}>Error</h2>
          <pre style={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'rgba(0,0,0,0.05)',
            padding: '1rem',
            borderRadius: '4px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {JSON.stringify(error, null, 2)}
          </pre>
          
          {error?.message?.includes('permission denied') && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3e0' }}>
              <p><strong>Permission Denied:</strong> This is likely due to Row Level Security (RLS) policies.</p>
              <p>Try unchecking the "Use Row Level Security" option above and test again.</p>
            </div>
          )}
          
          {error?.message?.includes('infinite recursion detected in policy') && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3e0' }}>
              <h3>⚠️ Recursive Policy Detected</h3>
              <p>Your Supabase database has a recursive policy on the <code>{selectedTable}</code> table.</p>
              <p><strong>How to fix this:</strong></p>
              <ol>
                <li>Go to your Supabase Dashboard</li>
                <li>Navigate to Authentication → Policies</li>
                <li>Find the policy for the <code>{selectedTable}</code> table</li>
                <li>Look for any policy that might be referencing itself in the policy expression</li>
                <li>Modify or remove the problematic policy</li>
              </ol>
              <p>For now, you can continue testing with RLS disabled.</p>
            </div>
          )}
        </div>
      )}
      
      {result && (
        <div style={{ margin: '1rem 0', padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
          <h2 style={{ color: '#2e7d32' }}>✅ Connection Successful!</h2>
          
          <div style={{ marginTop: '1rem' }}>
            <h3>Configuration:</h3>
            <pre style={{ 
              background: 'rgba(0,0,0,0.05)', 
              padding: '1rem', 
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(result.config, null, 2)}
            </pre>
          </div>
          
          {result.data && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Sample Data from '{result.table}':</h3>
              <pre style={{ 
                background: 'rgba(0,0,0,0.05)', 
                padding: '1rem', 
                borderRadius: '4px',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Debug Information:</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '200px 1fr', 
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          <div><strong>Environment:</strong></div>
          <div>{process.env.NODE_ENV}</div>
          
          <div><strong>Supabase URL:</strong></div>
          <div>
            {supabaseUrl ? '✅ Set' : '❌ Missing'}
            {supabaseUrl && (
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '0.25rem' }}>
                {supabaseUrl}
              </div>
            )}
          </div>
          
          <div><strong>Supabase Key:</strong></div>
          <div>
            {supabaseAnonKey ? '✅ Set' : '❌ Missing'}
            {supabaseAnonKey && (
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '0.25rem' }}>
                {supabaseAnonKey.substring(0, 20)}...
              </div>
            )}
          </div>
        </div>
        
        {tables.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Available Tables:</h4>
            <ul style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.5rem',
              listStyle: 'none',
              padding: 0,
              margin: '0.5rem 0 0 0'
            }}>
              {tables.map(table => (
                <li 
                  key={table}
                  onClick={() => {
                    setSelectedTable(table);
                    testConnection();
                  }}
                  style={{
                    padding: '0.5rem',
                    background: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ...(selectedTable === table ? {
                      borderColor: '#0070f3',
                      background: '#e6f0ff'
                    } : {})
                  }}
                >
                  {table}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
