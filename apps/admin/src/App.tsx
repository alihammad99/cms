import { h } from 'preact'
import Router, { Route, route } from 'preact-router'
import { useEffect } from 'preact/hooks'
import { isAuthenticated } from './lib/store'

import { LoginPage }         from './pages/Login'
import { StoresPage }        from './pages/Stores'
import { DashboardPage }     from './pages/Dashboard'
import { OrdersPage }        from './pages/OrdersPage'
import { ProductsPage }      from './pages/ProductsPage'
import { CollectionsListPage } from './pages/CollectionsList'
import { CollectionPage }    from './pages/Collections'
import { RecordFormPage }    from './pages/RecordForm'
import { SchemaEditorPage }  from './pages/SchemaEditor'
import { SettingsPage }      from './pages/Settings'
import { TeamPage }          from './pages/Team'
import { MediaPage }         from './pages/Media'

function AuthGuard({ children }: { children: h.JSX.Element }) {
  useEffect(() => {
    if (!isAuthenticated.value) route('/login', true)
  }, [])
  return isAuthenticated.value ? children : null
}

function guard(el: h.JSX.Element) {
  return <AuthGuard>{el}</AuthGuard>
}

export function App() {
  return (
    <Router>
      <Route path="/login" component={LoginPage} />
      <Route path="/stores" component={() => guard(<StoresPage />)} />

      <Route
        path="/stores/:storeSlug/dashboard"
        component={({ storeSlug }: any) => guard(<DashboardPage storeSlug={storeSlug} />)}
      />

      {/* ── Seller-friendly specialized pages ── */}
      <Route
        path="/stores/:storeSlug/orders"
        component={({ storeSlug }: any) => guard(<OrdersPage storeSlug={storeSlug} />)}
      />
      <Route
        path="/stores/:storeSlug/products"
        component={({ storeSlug }: any) => guard(<ProductsPage storeSlug={storeSlug} />)}
      />

      {/* ── Collections (generic fallback for custom / less common) ── */}
      <Route
        path="/stores/:storeSlug/collections"
        component={({ storeSlug }: any) => guard(<CollectionsListPage storeSlug={storeSlug} />)}
      />

      {/* orders + products → redirect to specialized pages */}
      <Route
        path="/stores/:storeSlug/collections/orders"
        component={({ storeSlug }: any) => {
          useEffect(() => route(`/stores/${storeSlug}/orders`, true), [])
          return null
        }}
      />
      <Route
        path="/stores/:storeSlug/collections/products"
        component={({ storeSlug }: any) => {
          useEffect(() => route(`/stores/${storeSlug}/products`, true), [])
          return null
        }}
      />

      <Route
        path="/stores/:storeSlug/collections/:collection/new"
        component={({ storeSlug, collection }: any) =>
          guard(<RecordFormPage storeSlug={storeSlug} collection={collection} id="new" />)
        }
      />
      <Route
        path="/stores/:storeSlug/collections/:collection/:id"
        component={({ storeSlug, collection, id }: any) =>
          guard(<RecordFormPage storeSlug={storeSlug} collection={collection} id={id} />)
        }
      />
      <Route
        path="/stores/:storeSlug/collections/:collection"
        component={({ storeSlug, collection }: any) =>
          guard(<CollectionPage storeSlug={storeSlug} collection={collection} />)
        }
      />

      {/* Schema */}
      <Route
        path="/stores/:storeSlug/schema/:collection"
        component={({ storeSlug, collection }: any) =>
          guard(<SchemaEditorPage storeSlug={storeSlug} collection={collection} />)
        }
      />
      <Route
        path="/stores/:storeSlug/schema"
        component={({ storeSlug }: any) =>
          guard(<SchemaEditorPage storeSlug={storeSlug} collection="products" />)
        }
      />

      <Route path="/stores/:storeSlug/media"    component={({ storeSlug }: any) => guard(<MediaPage    storeSlug={storeSlug} />)} />
      <Route path="/stores/:storeSlug/team"     component={({ storeSlug }: any) => guard(<TeamPage     storeSlug={storeSlug} />)} />
      <Route path="/stores/:storeSlug/settings" component={({ storeSlug }: any) => guard(<SettingsPage storeSlug={storeSlug} />)} />

      <Route
        path="/"
        component={() => {
          useEffect(() => { route(isAuthenticated.value ? '/stores' : '/login', true) }, [])
          return null
        }}
      />
    </Router>
  )
}
