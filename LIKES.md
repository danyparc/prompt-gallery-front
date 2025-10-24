Aquí tienes un ejemplo **completo y realista** en **JavaScript (ESM)** usando el cliente oficial de **Supabase JS v2** para crear un **like** sobre un `prompt`.

Este ejemplo asume que:

* Ya estás autenticado con Supabase Auth (el cliente tiene el `access_token` del usuario).
* Tu tabla se llama `prompt_like` (como en nuestra migración).
* Las políticas RLS permiten que cada usuario solo inserte likes para sí mismo (ya lo configuramos).

---

## 🧠 Concepto rápido

Cada **like** es un registro en la tabla `prompt_like` con:

```sql
prompt_id  UUID REFERENCES prompt(id)
user_id    UUID REFERENCES auth.users(id)
```

Y la PK es `(prompt_id, user_id)`.
Así, un usuario solo puede likear una vez cada prompt.
Si intenta hacerlo dos veces, obtendrá un error de conflicto.

---

## 💻 Ejemplo de código

```js
import { createClient } from '@supabase/supabase-js'

// 1️⃣ Inicializa el cliente (usa tus credenciales reales)
const supabase = createClient(
  'https://TU_PROJECT_URL.supabase.co',
  'eyTU-ANON-KEY'
)

// 2️⃣ ID del prompt a likear
const promptId = 'e1b0b052-47b3-4a7f-95ac-45116f123456'

// 3️⃣ Inserta el like
async function likePrompt(promptId) {
  // `auth.uid()` en la política usa el token del cliente autenticado
  const { data, error } = await supabase
    .from('prompt_like')
    .insert([{ prompt_id: promptId }]) // user_id se rellena por RLS
    .select()

  if (error) {
    if (error.code === '23505') {
      console.log('⚠️ Ya habías dado like a este prompt.')
    } else {
      console.error('❌ Error al crear el like:', error.message)
    }
    return null
  }

  console.log('✅ Like registrado:', data)
  return data
}

likePrompt(promptId)
```

---

## 💔 Para quitar el like

```js
async function unlikePrompt(promptId) {
  const { error } = await supabase
    .from('prompt_like')
    .delete()
    .eq('prompt_id', promptId)

  if (error) {
    console.error('❌ Error al quitar el like:', error.message)
  } else {
    console.log('💔 Like eliminado')
  }
}
```

---

## ⚙️ En el Frontend

Podrías conectar esto a un botón simple:

```jsx
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export default function LikeButton({ promptId }) {
  const [liked, setLiked] = useState(false)

  async function toggleLike() {
    if (!liked) {
      const { error } = await supabase.from('prompt_like').insert([{ prompt_id: promptId }])
      if (!error) setLiked(true)
    } else {
      const { error } = await supabase.from('prompt_like').delete().eq('prompt_id', promptId)
      if (!error) setLiked(false)
    }
  }

  return (
    <button
      onClick={toggleLike}
      className={`px-3 py-1 rounded ${liked ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}
    >
      {liked ? '❤️ Liked' : '🤍 Like'}
    </button>
  )
}
```

---

## ✅ Resumen

* Inserción simple en `prompt_like` → el trigger incrementa `likes_count` en `prompt`.
* RLS impide que insertes un like con otro `user_id`.
* Puedes detectar “ya likearon” por código de error `23505` o leyendo antes con:

  ```js
  const { data } = await supabase.from('prompt_like')
    .select('*').eq('prompt_id', promptId).single()
  ```

---

¿Quieres que te genere también un **hook React (`useLikePrompt`)** que maneje el estado local, optimismo y refresco de likes_count?
