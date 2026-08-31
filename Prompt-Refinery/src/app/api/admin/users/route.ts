import

{
 NextRequest
,
 NextResponse 
}

from

'next/server'
;

import

{
 getServerSession 
}

from

'next-auth'
;

import

{
 authOptions 
}

from

'@/lib/auth'
;

import

{
 prisma 
}

from

'@/lib/prisma'
;

import

{
 adminUserQuerySchema
,
 updateUserRoleSchema
,
 updateUserStatusSchema 
}

from

'@/lib/validators'
;

import

{
 isAdmin
,
 isSuperAdmin 
}

from

'@/lib/utils'
;

import

{
 Role
,
 AccountStatus 
}

from

'@prisma/client'
;

export

async

function

GET
(
req
:
 NextRequest
)

{

  
try

{

    
const
 session 
=

await

getServerSession
(
authOptions
)
;

    
if

(
!
session
?.
user 
||

!
isAdmin
(
session
.
user
.
role 
as
 Role
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

    
const

{
 searchParams 
}

=

new

URL
(
req
.
url
)
;

    
const
 query 
=
 adminUserQuerySchema
.
parse
(
Object
.
fromEntries
(
searchParams
)
)
;

    
const
 where
:

any

=

{
}
;

    
if

(
query
.
search
)

{

      where
.
OR

=

[

        
{
 name
:

{
 contains
:
 query
.
search
,
 mode
:

'insensitive'

}

}
,

        
{
 email
:

{
 contains
:
 query
.
search
,
 mode
:

'insensitive'

}

}
,

      
]
;

    
}

    
if

(
query
.
role
)
 where
.
role 
=
 query
.
role
;

    
if

(
query
.
status
)
 where
.
status 
=
 query
.
status
;

    
if

(
query
.
plan
)
 where
.
subscriptionPlan 
=
 query
.
plan
;

    
const

[
users
,
 total
]

=

await

Promise
.
all
(
[

      prisma
.
user
.
findMany
(
{

        where
,

        select
:

{

          id
:

true
,
 name
:

true
,
 email
:

true
,
 role
:

true
,
 status
:

true
,

          subscriptionPlan
:

true
,
 subscriptionStatus
:

true
,

          monthlyPromptCount
:

true
,
 totalPromptCount
:

true
,

          createdAt
:

true
,
 lastLoginAt
:

true
,

          _count
:

{
 select
:

{
 prompts
:

true

}

}
,

        
}
,

        orderBy
:

{

[
query
.
sortBy
]
:
 query
.
sortOrder 
}
,

        skip
:

(
query
.
page 
-

1
)

*
 query
.
limit
,

        take
:
 query
.
limit
,

      
}
)
,

      prisma
.
user
.
count
(
{
 where 
}
)
,

    
]
)
;

    
return
 NextResponse
.
json
(
{

      success
:

true
,

      data
:
 users
,

      meta
:

{
 page
:
 query
.
page
,
 limit
:
 query
.
limit
,
 total
,
 totalPages
:
 Math
.
ceil
(
total 
/
 query
.
limit
)

}
,

    
}
)
;

  
}

catch

(
error
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

'Failed to fetch users'

}
,

{
 status
:

500

}
)
;

  
}

}
