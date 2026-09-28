import React, { createContext, useContext, useState, useEffect } from 'react';
import { City, Area, Address } from '../types';
import { INITIAL_CITIES, INITIAL_AREAS } from '../lib/seed-data';

interface LocationContextType {
  cities: City[];
  selectedCity: City;
  selectedArea: Area;
  availableAreas: Area[];
  setSelectedCity: (city: City) => void;
  setSelectedArea: (area: Area) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  detectLocation: () => Promise<string>;
  savedAddresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  loadAddresses: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const DEFAULT_SAVED_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    user_id: 'user-cust-1',
    title: 'Home',
    receiver_name: 'Rahul Sharma',
    receiver_phone: '+91 98765 43210',
    flat_house_no: 'Flat 402, Green Avenue',
    area_locality: 'Model Town',
    city_id: 'city-ldh',
    city_name: 'Ludhiana',
    pincode: '141002',
    landmark: 'Near Krishna Mandir',
    is_default: true,
  },
  {
    id: 'addr-2',
    user_id: 'user-cust-1',
    title: 'Office',
    receiver_name: 'Rahul Sharma',
    receiver_phone: '+91 98765 43210',
    flat_house_no: 'Suite 301, Fortune Chambers',
    area_locality: 'Ferozepur Road',
    city_id: 'city-ldh',
    city_name: 'Ludhiana',
    pincode: '141012',
    landmark: 'Opposite Westend Mall',
    is_default: false,
  }
];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cities] = useState<City[]>(INITIAL_CITIES);
  const [selectedCity, setSelectedCityState] = useState<City>(INITIAL_CITIES[0]); // Ludhiana
  const [selectedArea, setSelectedAreaState] = useState<Area>(INITIAL_AREAS[0]); // Model Town
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(DEFAULT_SAVED_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(DEFAULT_SAVED_ADDRESSES[0]);

  // Load persisted location
  useEffect(() => {
    try {
      const savedCityId = localStorage.getItem('localkart_city_id');
      const savedAreaId = localStorage.getItem('localkart_area_id');

      if (savedCityId) {
        const c = cities.find(city => city.id === savedCityId);
        if (c) setSelectedCityState(c);
      }
      if (savedAreaId) {
        const a = INITIAL_AREAS.find(area => area.id === savedAreaId);
        if (a) setSelectedAreaState(a);
      }
    } catch (e) {
      console.warn('Could not read location from localStorage', e);
    }
  }, [cities]);

  const availableAreas = INITIAL_AREAS.filter(a => a.city_id === selectedCity.id);

  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    localStorage.setItem('localkart_city_id', city.id);
    // Auto-select first area in this city
    const firstArea = INITIAL_AREAS.find(a => a.city_id === city.id);
    if (firstArea) {
      setSelectedAreaState(firstArea);
      localStorage.setItem('localkart_area_id', firstArea.id);
    }
  };

  const setSelectedArea = (area: Area) => {
    setSelectedAreaState(area);
    localStorage.setItem('localkart_area_id', area.id);
  };

  const detectLocation = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('Geolocation is not supported by your browser. Please select manually.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In real deployment, reverse geocode with lat/lng. For demo:
          const { latitude } = position.coords;
          if (latitude > 30) {
            // Northern Punjab / Chandigarh
            setSelectedCity(cities[0]); // Ludhiana
            setSelectedArea(availableAreas[0]);
            resolve('Location detected: Model Town, Ludhiana');
          } else {
            // NCR
            const del = cities.find(c => c.name.includes('Delhi')) || cities[0];
            setSelectedCity(del);
            resolve(`Location detected: ${del.name}`);
          }
        },
        () => {
          resolve('Could not detect GPS location. Defaulting to Model Town, Ludhiana.');
        },
        { timeout: 5000 }
      );
    });
  };

  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/addresses?userId=user-cust-1');
      if (res.ok) {
        const data = await res.json();
        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          const def = data.addresses.find((a: Address) => a.is_default) || data.addresses[0];
          setSelectedAddress(def);
        }
      }
    } catch (e) {
      console.warn('Could not fetch addresses from API, using default', e);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const addAddress = async (addrData: Omit<Address, 'id'>): Promise<Address> => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addrData),
      });
      if (res.ok) {
        const data = await res.json();
        const created = data.address;
        const updated = [created, ...savedAddresses.filter(a => a.id !== created.id)];
        setSavedAddresses(updated);
        setSelectedAddress(created);
        return created;
      }
    } catch (e) {
      console.error('Error adding address via API:', e);
    }

    const fallback: Address = {
      ...addrData,
      id: `addr-${Date.now()}`
    };
    const updated = [fallback, ...savedAddresses];
    setSavedAddresses(updated);
    setSelectedAddress(fallback);
    return fallback;
  };

  const deleteAddress = async (id: string) => {
    try {
      await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete address on server:', e);
    }
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    if (selectedAddress?.id === id) {
      setSelectedAddress(updated[0] || null);
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await fetch(`/api/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_default', userId: 'user-cust-1' }),
      });
    } catch (e) {
      console.error('Failed to set default address on server:', e);
    }
    const updated = savedAddresses.map(a => ({
      ...a,
      is_default: a.id === id,
    }));
    setSavedAddresses(updated);
    const target = updated.find(a => a.id === id);
    if (target) setSelectedAddress(target);
  };

  return (
    <LocationContext.Provider
      value={{
        cities,
        selectedCity,
        selectedArea,
        availableAreas,
        setSelectedCity,
        setSelectedArea,
        isLocationModalOpen,
        setIsLocationModalOpen,
        detectLocation,
        savedAddresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        loadAddresses,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
};
