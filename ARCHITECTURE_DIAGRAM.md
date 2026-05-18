# Sơ Đồ Kiến Trúc - ecom-connector

## 1. Kiến Trúc Tổng Quan

```mermaid
graph TB
    subgraph "Client Application"
        APP[Application Code]
    end

    subgraph "ecom-connector Package"
        FACTORY[Factory<br/>createEcomConnector]
        INTERFACE[ECommercePlatform<br/>Interface]
        
        subgraph "Platform Implementations"
            ZALO[ZaloOAPlatform]
            TIKTOK[TikTokShopPlatform]
            SHOPEE[ShopeePlatform]
            LAZADA[LazadaPlatform]
        end
        
        subgraph "Common Models"
            PRODUCT[Product Model]
            ORDER[Order Model]
            CUSTOMER[Customer Model]
        end
        
        subgraph "Utils"
            TRANSFORM[Data Transformers]
            ERROR[EcomConnectorError]
        end
    end

    subgraph "External APIs"
        ZALO_API[Zalo OA API]
        TIKTOK_API[TikTok Shop API]
        SHOPEE_API[Shopee API]
        LAZADA_API[Lazada API]
    end

    APP -->|config| FACTORY
    FACTORY -->|creates| ZALO
    FACTORY -->|creates| TIKTOK
    FACTORY -->|creates| SHOPEE
    FACTORY -->|creates| LAZADA
    
    ZALO -.implements.- INTERFACE
    TIKTOK -.implements.- INTERFACE
    SHOPEE -.implements.- INTERFACE
    LAZADA -.implements.- INTERFACE
    
    ZALO -->|normalizes to| PRODUCT
    ZALO -->|normalizes to| ORDER
    TIKTOK -->|normalizes to| PRODUCT
    TIKTOK -->|normalizes to| ORDER
    SHOPEE -->|normalizes to| PRODUCT
    SHOPEE -->|normalizes to| ORDER
    LAZADA -->|normalizes to| PRODUCT
    LAZADA -->|normalizes to| ORDER
    
    ZALO -->|HTTP + Auth| ZALO_API
    TIKTOK -->|HTTP + HMAC| TIKTOK_API
    SHOPEE -->|HTTP + HMAC| SHOPEE_API
    LAZADA -->|HTTP + HMAC| LAZADA_API
    
    ZALO -.uses.- TRANSFORM
    TIKTOK -.uses.- TRANSFORM
    SHOPEE -.uses.- TRANSFORM
    LAZADA -.uses.- TRANSFORM
    
    ZALO -.throws.- ERROR
    TIKTOK -.throws.- ERROR
    SHOPEE -.throws.- ERROR
    LAZADA -.throws.- ERROR

    style FACTORY fill:#4CAF50,color:#fff
    style INTERFACE fill:#2196F3,color:#fff
    style PRODUCT fill:#FF9800,color:#fff
    style ORDER fill:#FF9800,color:#fff
    style CUSTOMER fill:#FF9800,color:#fff
```

## 2. Factory Pattern Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant Factory as createEcomConnector()
    participant Platform as Platform Instance
    participant API as E-commerce API

    App->>Factory: config { platform, credentials }
    
    alt platform === 'zalo-oa'
        Factory->>Platform: new ZaloOAPlatform(credentials)
    else platform === 'tiktok-shop'
        Factory->>Platform: new TikTokShopPlatform(credentials)
    else platform === 'shopee'
        Factory->>Platform: new ShopeePlatform(credentials)
    else platform === 'lazada'
        Factory->>Platform: new LazadaPlatform(credentials)
    end
    
    Factory-->>App: Platform instance
    
    App->>Platform: getProducts(options)
    Platform->>Platform: setupInterceptors() - Add auth
    Platform->>API: HTTP Request (signed)
    API-->>Platform: Platform-specific response
    Platform->>Platform: mapToProduct() - Normalize
    Platform-->>App: Product[] (unified model)
```

## 3. Data Normalization Pattern

```mermaid
graph LR
    subgraph "Platform Responses"
        ZR[Zalo Response]
        TR[TikTok Response]
        SR[Shopee Response]
        LR[Lazada Response]
    end
    
    subgraph "Mappers"
        ZM[mapZaloOAProductToProduct]
        TM[mapTikTokProductToProduct]
        SM[mapShopeeProductToProduct]
        LM[mapLazadaProductToProduct]
    end
    
    subgraph "Unified Model"
        P[Product<br/>id, name, price<br/>currency, status<br/>platformSpecific]
    end

    ZR -->|transform| ZM
    TR -->|transform| TM
    SR -->|transform| SM
    LR -->|transform| LM
    
    ZM --> P
    TM --> P
    SM --> P
    LM --> P

    style P fill:#4CAF50,color:#fff
```

## 4. Authentication Strategies

```mermaid
graph TB
    subgraph "Authentication Methods"
        subgraph "Zalo OA"
            Z1[access_token header]
            Z2[Simple Bearer Auth]
        end
        
        subgraph "Shopee"
            S1[HMAC-SHA256]
            S2[partner_id + partner_key]
            S3[timestamp + path + params]
            S4[Uppercase Hex]
        end
        
        subgraph "TikTok Shop"
            T1[HMAC-SHA256]
            T2[app_key + app_secret]
            T3[Sorted params]
            T4[Lowercase Hex]
        end
        
        subgraph "Lazada"
            L1[HMAC-SHA256]
            L2[app_key + app_secret]
            L3[Sorted concatenated params]
            L4[Uppercase Hex]
        end
    end
    
    subgraph "Axios Interceptors"
        INT[Request Interceptor]
    end
    
    Z1 --> Z2 --> INT
    S1 --> S2 --> S3 --> S4 --> INT
    T1 --> T2 --> T3 --> T4 --> INT
    L1 --> L2 --> L3 --> L4 --> INT
    
    INT -->|Auto-sign| REQ[HTTP Request]

    style INT fill:#FF5722,color:#fff
```

## 5. File Structure Architecture

```mermaid
graph TD
    ROOT[src/]
    
    ROOT --> FACTORY[factory.ts<br/>Platform instantiation]
    ROOT --> INTERFACE[interfaces.ts<br/>Common types & errors]
    ROOT --> INDEX[index.ts<br/>Public exports]
    ROOT --> PLATFORMS[platforms/]
    
    PLATFORMS --> ZALO_DIR[zalooa/]
    PLATFORMS --> TIKTOK_DIR[tiktokshop/]
    PLATFORMS --> SHOPEE_DIR[shopee/]
    PLATFORMS --> LAZADA_DIR[lazada/]
    
    ZALO_DIR --> Z_INDEX[index.ts<br/>ZaloOAPlatform class]
    ZALO_DIR --> Z_TYPES[types.ts<br/>API response types]
    ZALO_DIR --> Z_CONST[constants.ts<br/>Endpoints & config]
    
    TIKTOK_DIR --> T_INDEX[index.ts<br/>TikTokShopPlatform class]
    TIKTOK_DIR --> T_TYPES[types.ts<br/>API response types]
    TIKTOK_DIR --> T_CONST[constants.ts<br/>Endpoints & config]
    
    SHOPEE_DIR --> S_INDEX[index.ts<br/>ShopeePlatform class]
    SHOPEE_DIR --> S_TYPES[types.ts<br/>API response types]
    SHOPEE_DIR --> S_CONST[constants.ts<br/>Endpoints & config]
    
    LAZADA_DIR --> L_INDEX[index.ts<br/>LazadaPlatform class]
    LAZADA_DIR --> L_TYPES[types.ts<br/>API response types]
    LAZADA_DIR --> L_CONST[constants.ts<br/>Endpoints & config]

    style ROOT fill:#9C27B0,color:#fff
    style FACTORY fill:#4CAF50,color:#fff
    style INTERFACE fill:#2196F3,color:#fff
```

## 6. Interface Implementation Pattern

```mermaid
classDiagram
    class ECommercePlatform {
        <<interface>>
        +getProducts(options?) Product[]
        +getProductById(id) Product
        +getOrders(options?) Order[]
        +getOrderById(id) Order
        +updateProductStock(id, quantity) Product
        +updateOrderStatus(id, status) Order
    }
    
    class ZaloOAPlatform {
        -client: AxiosInstance
        -credentials: ZaloOACredentials
        -setupInterceptors()
        +getProducts(options?) Product[]
        +getProductById(id) Product
        -mapZaloOAProductToProduct() Product
    }
    
    class ShopeePlatform {
        -client: AxiosInstance
        -credentials: ShopeeCredentials
        -generateSignature() string
        -setupInterceptors()
        +getProducts(options?) Product[]
        +getProductById(id) Product
        -mapShopeeProductToProduct() Product
    }
    
    class TikTokShopPlatform {
        -client: AxiosInstance
        -credentials: TikTokShopCredentials
        -generateSignature() string
        -setupInterceptors()
        +getProducts(options?) Product[]
        +getProductById(id) Product
        -mapTikTokProductToProduct() Product
    }
    
    class LazadaPlatform {
        -client: AxiosInstance
        -credentials: LazadaCredentials
        -generateSignature() string
        -setupInterceptors()
        +getProducts(options?) Product[]
        +getProductById(id) Product
        -mapLazadaProductToProduct() Product
    }
    
    ECommercePlatform <|.. ZaloOAPlatform
    ECommercePlatform <|.. ShopeePlatform
    ECommercePlatform <|.. TikTokShopPlatform
    ECommercePlatform <|.. LazadaPlatform
```

## 7. Data Flow cho getProducts()

```mermaid
sequenceDiagram
    participant Client
    participant Platform
    participant Interceptor
    participant API
    participant Mapper

    Client->>Platform: getProducts(options)
    
    activate Platform
    Platform->>Platform: Build request params
    Platform->>Interceptor: axios.get('/products', params)
    
    activate Interceptor
    alt Shopee/TikTok/Lazada
        Interceptor->>Interceptor: generateSignature()
        Interceptor->>Interceptor: Add sign param
    else Zalo OA
        Interceptor->>Interceptor: Add access_token header
    end
    deactivate Interceptor
    
    Interceptor->>API: HTTP GET (authenticated)
    
    activate API
    API-->>Interceptor: Platform-specific JSON
    deactivate API
    
    Interceptor-->>Platform: response.data
    
    Platform->>Mapper: mapToProduct(rawData)
    activate Mapper
    Mapper->>Mapper: Extract common fields
    Mapper->>Mapper: Map status codes
    Mapper->>Mapper: Set currency default
    Mapper->>Mapper: Preserve platformSpecific
    Mapper-->>Platform: Product[]
    deactivate Mapper
    
    Platform-->>Client: Product[] (unified)
    deactivate Platform
```

## 8. Error Handling Flow

```mermaid
graph TD
    START[API Call] --> TRY{Try}
    
    TRY -->|Success| RESPONSE[Got Response]
    TRY -->|Error| CHECK{Error Type?}
    
    CHECK -->|EcomConnectorError| RETHROW[Re-throw as-is]
    CHECK -->|Network Error| WRAP1[Wrap in EcomConnectorError<br/>code: NETWORK_ERROR]
    CHECK -->|API Error| WRAP2[Wrap in EcomConnectorError<br/>code: API_ERROR<br/>statusCode: response.status]
    CHECK -->|Unknown| WRAP3[Wrap in EcomConnectorError<br/>code: UNKNOWN_ERROR<br/>originalError: preserved]
    
    RESPONSE --> MAP[Map to unified model]
    MAP --> RETURN[Return to client]
    
    RETHROW --> THROW[Throw to client]
    WRAP1 --> THROW
    WRAP2 --> THROW
    WRAP3 --> THROW

    style THROW fill:#f44336,color:#fff
    style RETURN fill:#4CAF50,color:#fff
```

## 9. Config & Credentials Flow

```mermaid
graph LR
    subgraph "Configuration Input"
        ENV[Environment Variables]
        CODE[Direct Config Object]
    end
    
    subgraph "Factory"
        VALIDATE[Validate Config]
        SELECT[Select Platform Type]
        CREATE[Create Instance]
    end
    
    subgraph "Platform Instance"
        CREDS[Store Credentials]
        AXIOS[Create Axios Instance]
        SETUP[Setup Interceptors]
    end

    ENV --> VALIDATE
    CODE --> VALIDATE
    VALIDATE --> SELECT
    SELECT -->|'zalo-oa'| CREATE
    SELECT -->|'shopee'| CREATE
    SELECT -->|'tiktok-shop'| CREATE
    SELECT -->|'lazada'| CREATE
    CREATE --> CREDS
    CREDS --> AXIOS
    AXIOS --> SETUP
    SETUP --> READY[Ready for API Calls]

    style READY fill:#4CAF50,color:#fff
```

## 10. Các Thành Phần Chính

### Factory (Entry Point)
- **File**: `src/factory.ts`
- **Chức năng**: Nhận config, chọn platform, tạo instance
- **Pattern**: Factory Pattern

### Platform Implementations
- **Zalo OA**: Simple token auth
- **Shopee**: HMAC-SHA256 (uppercase hex)
- **TikTok Shop**: HMAC-SHA256 (lowercase hex)  
- **Lazada**: HMAC-SHA256 (uppercase hex)

### Common Models
- `Product`: id, name, price, currency, status, platformSpecific
- `Order`: id, status, totalAmount, items[], customer
- `OrderItem`: productId, quantity, price
- `Customer`: id, name, email, phone

### Error Handling
- `EcomConnectorError`: Unified error with code, message, statusCode, originalError

## Lưu Ý Quan Trọng

1. **Single Responsibility**: Mỗi platform class chỉ xử lý 1 nền tảng
2. **Data Normalization**: Tất cả response được chuẩn hóa về common models
3. **platformSpecific Field**: Lưu trữ raw data gốc để preserve vendor-specific fields
4. **Authentication**: Tự động inject vào mọi request qua axios interceptors
5. **Timestamp Handling**: Chuyển đổi giữa seconds/milliseconds cho Date objects
6. **No External Dependencies**: Chỉ dùng axios, không dùng moment/lodash
