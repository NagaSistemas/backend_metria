'use client'
import { useCart } from '@/context/CartContext'
import Cart from '@/components/ui/Cart'

export default function MenuPage() {
  const { dispatch } = useCart()
  
  const addToCart = (item: any) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }
  
  return (
    <>
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'Arial' }}>
      <header style={{ 
        backgroundColor: 'rgba(0,0,0,0.95)', 
        padding: '20px', 
        borderBottom: '1px solid #D4AF37' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '18px' }}>
            ← Voltar
          </a>
          <h1 style={{ color: '#D4AF37', fontSize: '24px', margin: 0, fontWeight: 'bold' }}>
            🍕 CARDÁPIO DIGITAL
          </h1>
        </div>
      </header>

      <div style={{ padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '48px', color: '#D4AF37', marginBottom: '16px', fontWeight: 'bold' }}>
            Bem-vindo ao Muzzajazz
          </h2>
          <p style={{ fontSize: '20px', opacity: 0.9 }}>
            Onde cada sabor encontra sua nota musical
          </p>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '36px', color: '#D4AF37', textAlign: 'center', marginBottom: '40px' }}>
            🍕 Pizzas Artesanais
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '30px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{ 
              backgroundColor: '#333', 
              borderRadius: '20px', 
              padding: '24px', 
              border: '1px solid #D4AF37' 
            }}>
              <div style={{ 
                width: '100%', 
                height: '200px', 
                backgroundColor: '#555', 
                borderRadius: '12px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px'
              }}>
                🍕
              </div>
              <h4 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px', fontWeight: 'bold' }}>
                Ella Fitzgerald
              </h4>
              <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px', lineHeight: '1.5' }}>
                Massa artesanal, mozzarella de búfala, manjericão fresco, tomate cereja, pesto especial
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '24px' }}>R$ 50,00</span>
                <button 
                  onClick={() => addToCart({ id: 1, name: 'Ella Fitzgerald', price: 50.00, image: '🍕' })}
                  style={{ 
                    backgroundColor: '#D4AF37', 
                    color: '#000', 
                    border: 'none', 
                    padding: '12px 24px', 
                    borderRadius: '25px', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                  Adicionar
                </button>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#333', 
              borderRadius: '20px', 
              padding: '24px', 
              border: '1px solid #D4AF37' 
            }}>
              <div style={{ 
                width: '100%', 
                height: '200px', 
                backgroundColor: '#555', 
                borderRadius: '12px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px'
              }}>
                🍕
              </div>
              <h4 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px', fontWeight: 'bold' }}>
                Nina Simone
              </h4>
              <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px', lineHeight: '1.5' }}>
                Bacon defumado, gorgonzola DOP, mozzarella, tomate cereja, cebola roxa, pesto de rúcula
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '24px' }}>R$ 53,00</span>
                <button 
                  onClick={() => addToCart({ id: 2, name: 'Nina Simone', price: 53.00, image: '🍕' })}
                  style={{ 
                    backgroundColor: '#D4AF37', 
                    color: '#000', 
                    border: 'none', 
                    padding: '12px 24px', 
                    borderRadius: '25px', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                  Adicionar
                </button>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#333', 
              borderRadius: '20px', 
              padding: '24px', 
              border: '1px solid #D4AF37' 
            }}>
              <div style={{ 
                width: '100%', 
                height: '200px', 
                backgroundColor: '#555', 
                borderRadius: '12px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px'
              }}>
                🍕
              </div>
              <h4 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px', fontWeight: 'bold' }}>
                Elis Regina
              </h4>
              <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px', lineHeight: '1.5' }}>
                Calabresa artesanal, mozzarella, tomate cereja, pesto de rúcula, cebola roxa, orégano
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '24px' }}>R$ 53,00</span>
                <button 
                  onClick={() => addToCart({ id: 3, name: 'Elis Regina', price: 53.00, image: '🍕' })}
                  style={{ 
                    backgroundColor: '#D4AF37', 
                    color: '#000', 
                    border: 'none', 
                    padding: '12px 24px', 
                    borderRadius: '25px', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </section>

        <div style={{ position: 'fixed', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            style={{ 
              backgroundColor: '#D4AF37', 
              color: '#000', 
              border: 'none', 
              padding: '20px', 
              borderRadius: '50%', 
              fontSize: '32px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
            🛒
          </button>
          <button style={{ 
            backgroundColor: '#D4AF37', 
            color: '#000', 
            border: 'none', 
            padding: '20px', 
            borderRadius: '50%', 
            fontSize: '32px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            🤖
          </button>
        </div>
      </div>
      <Cart />
    </div>
    </>
  )
}