import { Helmet } from "react-helmet-async";

const BASE_URL = import.meta.env.VITE_APP_URL || window.location.origin;

const SEO = ({
  title = "TechStore",
  description = "Shop bán thiết bị công nghệ chính hãng",
  image = "https://res.cloudinary.com/drhh1gzoz/image/upload/v1780387216/logo_techstore_huwdqr.jpg",
  url = "",
  type = "website",
  noIndex = false 
}) => {
  const fullTitle = `${title} | TechStore`;

  const currentUrl = url
    ? `${BASE_URL}${url}`
    : window.location.href;

  return (
    <Helmet>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* SEO cơ bản */}
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="TechStore" />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={currentUrl} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEO;