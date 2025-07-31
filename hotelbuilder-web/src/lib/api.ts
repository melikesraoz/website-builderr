
export const loginUser = async (email: string, password: string) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    if (!res.ok) {
      throw new Error('Giriş başarısız');
    }
  
    return res.json(); // içinde token ve user bilgisi olacak
  };
  

export async function getMyHotels() {
    const token = localStorage.getItem('token');
  
    const res = await fetch('http://localhost:5000/api/hotel/my-hotels', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      throw new Error('Otel verileri alınamadı');
    }
  
    return res.json(); // { hotels: [...] }
  }
  