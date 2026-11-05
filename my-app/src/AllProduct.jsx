import { useEffect, useState } from 'react';
import { moneyformat } from './usemoneyFormat';
function AllProduct() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    useEffect(() => {
        let isActive = true;

        async function loadProducts() {
            setLoading(true);
            setError('');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            try {
                const response = await fetch("http://127.0.0.1:8000/api/products", {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}.`);
                }
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('The server returned an invalid product list.');
                }
                if (isActive) setProducts(data);
            } catch (fetchError) {
                if (isActive) {
                    setError(fetchError instanceof Error && fetchError.name === 'AbortError'
                        ? 'The server did not respond in time.'
                        : fetchError instanceof Error ? fetchError.message : 'Could not load products.');
                }
            } finally {
                clearTimeout(timeoutId);
                if (isActive) setLoading(false);
            }
        }

        loadProducts();
        return () => {
            isActive = false;
        };
    }, [reloadKey]);

    return (
        <main className="home-page">
           
            {loading ? (
                <p className="home-message" role="status">Loading products...</p>
            ) : error ? (
                
                <div className="home-message" role="alert">
                    <p>Products could not be loaded: {error}</p>
                    <p>Check that the backend is running, then try again.</p>
                    <button type="button" onClick={() => setReloadKey((key) => key + 1)}>Retry</button>
                </div>
            ) : products.length === 0 ? (
                <p className="home-message">No products have been posted yet.</p>
            ) : (
                <section className="product-list">
                    {products.map((product) => {
                        const isForSale = product.type?.toLowerCase() === 'sell';

                        return (
                            <article key={product.id} className="product-card">
                                <div className="imgcontainer">
                                    {product.image ? (
                                        <img
                                            src={`http://127.0.0.1:8000/uploads/${product.image}`}
                                            alt={product.name}
                                        />
                                    ) : (
                                        <span className="image-placeholder">Image unavailable</span>
                                    )}
                                    <span className={`product-type ${isForSale ? 'for-sale' : 'for-rent'}`}>
                                        For {isForSale ? 'Sale' : 'Rent'}
                                    </span>
                                </div>
                                <div className="product-card-content">
                                    <div className="product-card-heading">
                                        <h2>{product.name}</h2>
                                        <p className="product-price">{moneyformat(product.price)}</p>
                                    </div>
                                    <p className="product-description">
                                        {product.description || 'No description provided.'}
                                    </p>
                                    <div className="product-card-footer">
                                        <span className="contact-label">Contact</span>
                                        <span className="product-contact">{product.contact || 'Not provided'}</span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
}
export default AllProduct;