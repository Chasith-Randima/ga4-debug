import Script from 'next/script';

export default function DummyThankYou() {
  return (
    <div id="content" className="site-content">
      <div className="title__wrapper checkout-banner">
        <div className="container">
          <nav className="woocommerce-breadcrumb">
            <a href="/">Home</a> <i className="fas fa-angle-right"></i> <a id="second-level-breadcrumb" href="/shop">All Puppies</a> <i className="fas fa-angle-right"></i> <a id="second-level-breadcrumb" href="/checkout">Order Successful</a> <i className="fas fa-angle-right"></i> <span className="post-current-title">Order received</span>
          </nav>
          <h1 className="entry-title-checkout">Order Successful</h1>
        </div>
      </div>
      <div className="container main__container__wrapper px-3 px-md-0">
        <section id="primary" className="content-area col-sm-12">
          <div id="main" className="site-main" role="main">
            <article id="post-15" className="post-15 page type-page status-publish hentry">
              <header className="entry-header">
                <h1 className="entry-title">Order Successful</h1>
              </header>
              <div className="entry-content">
                <div className="woocommerce">
                  <div className="woocommerce-order">
                    <p className="woocommerce-notice woocommerce-notice--success woocommerce-thankyou-order-received">
                      Your purchase is now complete! You will receive an email with instructions and important information within 15 minutes. Please check your spam folder as well.
                    </p>
                    <div className="d-lg-flex">
                      <div className="col-md-6 order__details__wrapper">
                        <span><strong>Order ID</strong> 12345</span><br />
                        <span><strong>Date</strong> July 7, 2025</span><br />
                        <span><strong>Paid by</strong> Credit Card</span>
                      </div>
                      <div className="col-md-6 buyer__details__wrapper">
                        <h3><strong>Buyer Details</strong></h3>
                        <span><strong>Jane Doe</strong></span>
                        <span>123 Test Street,</span><br />
                        <span>Test Apartment</span><br />
                        <span>12345</span><br />
                        <span>Test City</span><br />
                        <span>NY</span><br />
                        <span>jane.doe@example.com</span><br />
                        <span>+1234567890</span><br />
                      </div>
                    </div>
                    <br />
                    <section className="woocommerce-order-details">
                      <table className="woocommerce-table woocommerce-table--order-details shop_table order_details">
                        <thead></thead>
                        <tbody>
                          <tr className="woocommerce-table__line-item order_item">
                            <td className="woocommerce-table__product-name product-name">
                              GOLDEN RETRIEVER | FEMALE | ID:TEST-ORDER
                            </td>
                            <td className="woocommerce-table__product-total product-total">
                              <span className="woocommerce-Price-amount amount"><bdi><span className="woocommerce-Price-currencySymbol">$</span>1500</bdi></span>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <th scope="row">Discount:</th>
                            <td>-<span className="woocommerce-Price-amount amount"><span className="woocommerce-Price-currencySymbol">$</span>100</span></td>
                          </tr>
                          <tr>
                            <th scope="row">Direct Home Delivery</th>
                            <td><span className="woocommerce-Price-amount amount"><span className="woocommerce-Price-currencySymbol">$</span>50.00</span></td>
                          </tr>
                          <tr>
                            <th scope="row">Tax (NY Sales Tax Does Not Apply)</th>
                            <td><span className="woocommerce-Price-amount amount"><span className="woocommerce-Price-currencySymbol">$</span>0</span></td>
                          </tr>
                          <tr>
                            <th scope="row">Total</th>
                            <td><span className="woocommerce-Price-amount amount"><span className="woocommerce-Price-currencySymbol">$</span>1450</span></td>
                          </tr>
                        </tfoot>
                      </table>
                    </section>
                    <section className="woocommerce-customer-details">
                      <h2 className="woocommerce-column__title">Billing address</h2>
                      <address>
                        Jane Doe<br />123 Test Street<br />Test Apartment<br />Test City, NY 12345
                        <p className="woocommerce-customer-details--phone">+1234567890</p>
                        <p className="woocommerce-customer-details--email">jane.doe@example.com</p>
                      </address>
                    </section>
                    <a className="woocommerce--back--to--home--link" href="/">
                      <div className="woocommerce__back__to__home">Back to home</div>
                    </a>
                    <p className="text-center mt-2 any__issue">Any issue? <a href="/contact-us">Contact Us</a></p>
                  </div>
                </div>
              </div>
              <footer className="entry-footer">
                <span className="edit-link"><a className="post-edit-link" href="#">Edit <span className="screen-reader-text">"Order Successful"</span></a></span>
              </footer>
            </article>
          </div>
        </section>
      </div>
      
      {/* Inject environment variable for API base URL */}
      <Script id="env-config" strategy="beforeInteractive">
        {`
          window.DEBUG_API_BASE_URL = '${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ga4-debug.onrender.com/'}';
        `}
      </Script>
      
      {/* Debug Script */}
      <Script src="/debug-script.js" strategy="afterInteractive" />
    </div>
  );
} 