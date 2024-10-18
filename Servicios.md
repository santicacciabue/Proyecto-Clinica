- Gestión de Usuarios:
    . GET - /api/obtenerUsuarios

    . GET - /api/obtenerUsuario/:id

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
- Gestion de Turnos:
    . GET - /api/obtenerTurnoPaciente/:id
    . POST - /api/obtenerTurnosMedico
            body:
            {
                "id_medico":tinyint,
                "fecha":string
            }
    . POST - /api/asignarTurnoPaciente
            body:
            {
                "nota": string,
                "id_agenda": string,
                "fecha": string,
                "hora": string (HH:mm),
                "id_paciente": tinyint,
                "id_cobertura": tinyint,
            }
    . PUT - /actualizarTurnoPaciente/:id
            body:
            {
               "nota": string,
                "id_agenda": string,
                "fecha": string,
                "hora": string (HH:mm),
                "id_paciente": tinyint,
                "id_cobertura": tinyint
            }
    .DELETE - /eliminarTurnoPaciente/:id

        