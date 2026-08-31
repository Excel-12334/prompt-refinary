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
 isAdmin 
}

from

'@/lib/utils'
;

import

{
 Role 
}

from

'@prisma/client'
;

import

{
 startOfMonth
,
 endOfMonth 
}

from

'date-fns'
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
 now 
=

new

Date
(
)
;

    
const
 monthStart 
=

startOfMonth
(
now
)
;

    
const
 monthEnd 
=

endOfMonth
(
now
)
;

    
const

[

      totalUsers
,

      newUsersThisMonth
,

      activeUsers
,

      totalPrompts
,

      promptsThisMonth
,

      popularCategories
,

      popularPlatforms
,

      usageByDay
,

      subscriptionStats
,

    
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
count
(
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
:

{
 createdAt
:

{
 gte
:
 monthStart
,
 lte
:
 monthEnd 
}

}

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
:

{
 lastLoginAt
:

{
 gte
:

new

Date
(
now
.
getTime
(
)

-

30

*

24

*

60

*

60

*

1000
)

}

}

}
)
,

      prisma
.
prompt
.
count
(
{
 where
:

{
 status
:

'ACTIVE'

}

}
)
,

      prisma
.
prompt
.
count
(
{
 where
:

{
 createdAt
:

{
 gte
:
 monthStart
,
 lte
:
 monthEnd 
}

}

}
)
,

      prisma
.
prompt
.
groupBy
(
{

        by
:

[
'categoryId'
]
,

        where
:

{
 createdAt
:

{
 gte
:
 monthStart 
}

}
,

        _count
:

true
,

        orderBy
:

{
 _count
:

{
 categoryId
:

'desc'

}

}
,

        take
:

5
,

      
}
)
,

      prisma
.
prompt
.
groupBy
(
{

        by
:

[
'targetPlatformId'
]
,

        where
:

{
 createdAt
:

{
 gte
:
 monthStart 
}

}
,

        _count
:

true
,

        orderBy
:

{
 _count
:

{
 targetPlatformId
:

'desc'

}

}
,

        take
:

5
,

      
}
)
,

      prisma
.
usageRecord
.
groupBy
(
{

        by
:

[
'createdAt'
]
,

        where
:

{
 createdAt
:

{
 gte
:
 monthStart 
}

}
,

        _count
:

true
,

      
}
)
,

      prisma
.
user
.
groupBy
(
{

        by
:

[
'subscriptionPlan'
]
,

        _count
:

true
,

      
}
)
,

    
]
)
;

    
// Get category names

    
const
 categoryIds 
=
 popularCategories
.
map
(
c 
=>
 c
.
categoryId
)
.
filter
(
Boolean
)
;

    
const
 categories 
=

await
 prisma
.
promptCategory
.
findMany
(
{

      where
:

{
 id
:

{

in
:
 categoryIds 
as

string
[
]

}

}
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

}
,

    
}
)
;

    
const
 platformIds 
=
 popularPlatforms
.
map
(
p 
=>
 p
.
targetPlatformId
)
.
filter
(
Boolean
)
;

    
const
 platforms 
=

await
 prisma
.
aIPlatform
.
findMany
(
{

      where
:

{
 id
:

{

in
:
 platformIds 
as

string
[
]

}

}
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

}
,

    
}
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

{

        totalUsers
,

        newUsersThisMonth
,

        activeUsers
,

        totalPrompts
,

        promptsThisMonth
,

        popularCategories
:
 popularCategories
.
map
(
c 
=>

(
{

          name
:
 categories
.
find
(
cat 
=>
 cat
.
id 
===
 c
.
categoryId
)
?.
name 
||

'Unknown'
,

          count
:
 c
.
_count
,

        
}
)
)
,

        popularPlatforms
:
 popularPlatforms
.
map
(
p 
=>

(
{

          name
:
 platforms
.
find
(
plat 
=>
 plat
.
id 
===
 p
.
targetPlatformId
)
?.
name 
||

'Unknown'
,

          count
:
 p
.
_count
,

        
}
)
)
,

        usageByDay
:
 usageByDay
.
map
(
u 
=>

(
{

          date
:
 u
.
createdAt
.
toISOString
(
)
.
split
(
'T'
)
[
0
]
,

          count
:
 u
.
_count
,

        
}
)
)
,

        subscriptionStats
:
 subscriptionStats
.
map
(
s 
=>

(
{

          plan
:
 s
.
subscriptionPlan
,

          count
:
 s
.
_count
,

        
}
)
)
,

      
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

    
console
.
error
(
'Analytics error:'
,
 error
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

false
,
 error
:

'Failed to fetch analytics'

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
