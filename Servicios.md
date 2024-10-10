- Gestión de Usuarios:
    . GET - /api/obtenerUsuarios

    . GET - /api/obtenerUsuarios/:id

    . POST - /api/crearUsuario
        body:
        {
            "apellido": string,
            "nombre": string,
            "fecha_nacimiento": string (AAAA-MM-DD),
            "password": string,
            "usuario": string,
            "rol": string (operador, administrador, paciente, medico),
            "email": string,
            "telefono": string,
            "dni": string
        }
    . PUT - /actualizarUsuario/:id
        body:
        {
            "apellido": string,
            "nombre": string,
            "fecha_nacimiento": string (AAAA-MM-DD),
            "password": string,
            "usuario": string,
            "rol": string (operador, administrador, paciente, medico),
            "email": string,
            "telefono": string,
            "dni": string
        }
- Login
    . POST - /api/login
    body:
    {
        usuario: string,
        password: string
    }
    . PUT - /api//resetearPassword/:id
    body: {
        password: string
    }
    