import

{
 NextResponse 
}

from

'next/server'
;

import

{
 withAuth 
}

from

'next-auth/middleware'
;

import

{
 Role 
}

from

'@prisma/client'
;

export

default

withAuth
(

  
function

middleware
(
req
)

{

    
const
 token 
=
 req
.
nextauth
.
token
;

    
const
 path 
=
 req
.
nextUrl
.
pathname
;

    
// Admin routes protection

    
if

(
path
.
startsWith
(
'/api/admin'
)
)

{

      
if

(
!
token 
||

(
token
.
role 
!==
 Role
.
ADMIN

&&
 token
.
role 
!==
 Role
.
SUPER_ADMIN
)
)

{

        
return
 NextResponse
.
json
(
{
 success
:

false
,
 error
:

'Forbidden'

}
,

{
 status
:

403

}
)
;

      
}

    
}

    
// Super Admin routes protection

    
if

(
path
.
startsWith
(
'/api/admin/settings'
)

||
 path
.
startsWith
(
'/api/admin/logs'
)
)

{

      
if

(
!
token 
||
 token
.
role 
!==
 Role
.
SUPER_ADMIN
)

{

        
return
 NextResponse
.
json
(
{
 success
:

false
,
 error
:

'Super Admin required'

}
,

{
 status
:

403

}
)
;

      
}

    
}

    
return
 NextResponse
.
next
(
)
;

  
}
,

  
{

    callbacks
:

{

      
authorized
(
{
 req
,
 token 
}
)

{

        
if

(
req
.
nextUrl
.
pathname
.
startsWith
(
'/api/auth'
)
)

return

true
;

        
return

!
!
token
;

      
}
,

    
}
,

    pages
:

{

      signIn
:

'/login'
,

    
}
,

  
}

)
;

export

const
 config 
=

{

  matcher
:

[
'/api/prompts/:path*'
,

'/api/refine/:path*'
,

'/api/versions/:path*'
,

'/api/folders/:path*'
,

'/api/tags/:path*'
,

'/api/admin/:path*'
,

'/api/subscriptions/:path*'
,

'/api/usage/:path*'
]
,

}
;
