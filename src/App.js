import React, { useState, useEffect } from 'react';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  useQuery,
  gql,
} from '@apollo/client';
import './App.css';

const apiUrl = 'https://countries.trevorblades.com/graphql';

const GET_COUNTRIES = gql`
  query GetAllCountries {
    countries {
      code
      name
      native
      capital
      emoji
      currency
      languages {
        code
        name
      }
    }
  }
`;

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('size');
  const [selectedCountryInfo, setSelectedCountryInfo] = useState(null);
  const [selectedCountryColor, setSelectedCountryColor] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const { loading, data } = useQuery(GET_COUNTRIES, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [loading]);

  if (isLoading) {
    return <p style={{ textAlign: 'center', fontSize: '100px' }}>Loading...</p>;
  }

  const countries = data.countries;
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCountries = {};

  filteredCountries.forEach((country) => {
    const key = groupBy === 'size' ? country.name : '';
    if (!groupedCountries[key]) {
      groupedCountries[key] = [];
    }
    groupedCountries[key].push(country);
  });

  const toggleCountrySelection = (country) => {
    if (selectedCountryInfo === country) {
      setSelectedCountryInfo(null);
    } else {
      setSelectedCountryInfo(country);

      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      setSelectedCountryColor({
        [country.name]: randomColor,
      });
    }
  };

  return (
    <div className="App">
      <h1>GraphQL Ülke Arama ve Gruplama</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          height: '30px',
          width: '150px',
          borderRadius: '10px',
          textAlign: 'center',
        }}
      />

      <div className="countryList">
        {Object.keys(groupedCountries).map((key) => (
          <div key={key} className="countryGroup">
            <ul>
              <li style={{ fontSize: '20px', fontWeight: 'bolder' }}>{key}</li>
              {groupedCountries[key].map((country) => (
                <div
                  key={country.name}
                  className={`country ${
                    selectedCountryInfo === country ? 'selected' : ''
                  }`}
                  style={{ backgroundColor: selectedCountryColor[country.name] }}
                  onClick={() => toggleCountrySelection(country)}
                >
                  <p>
                    <span style={{ fontWeight: 'bolder' }}>Currency:</span>{' '}
                    <span>{country.currency}</span>
                  </p>
                  <p>
                    <span style={{ fontWeight: 'bolder' }}>Capital city:</span>{' '}
                    <span>{country.capital}</span>
                  </p>
                </div>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const client = new ApolloClient({
  uri: apiUrl,
  cache: new InMemoryCache(),
});

function WrappedApp() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

export default WrappedApp;
