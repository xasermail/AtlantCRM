/* получение абонемента человека 
   это будет либо последний действующий, либо просто последний, либо пустой dataset, если абонемента нет вообще
*/

if exists(select 1 from sys.procedures as a where a.name = 'GET_ABON_LAST') drop procedure dbo.GET_ABON_LAST;

GO

create procedure [dbo].[GET_ABON_LAST]
  @o_ank_id int,
  @m_org_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

declare @d smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);

with t as (
  -- все абонементы по человеку
  select
    rp.*
  from
    dbo.O_SKLAD_RAS r
    join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
    join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
  where
    r.O_ANK_ID = @o_ank_id
    and p.IS_ABON = 1
)
-- выбираем последний действующий, если есть, а если нет - то просто последний
select top 1
  *
from
  (
    -- это последний действующий
    select top 1
      1 rn,
      t1.*
    from
      t t1
    where
      @d between t1.D_VID and t1.D_DEISTV
    order by
      t1.ID desc

    union all

    -- это просто последний, даже если он не действует
    select top 1
      2 rn,
      t2.*
    from
      t t2
    order by
      t2.ID desc
  ) t3
-- сортировка по приоритету, сначала действующий, если есть, затем просто последний
order by
  t3.rn asc
;
  
end;

go


set dateformat dmy;
exec dbo.GET_ABON_LAST @o_ank_id = 79, @m_org_id = 1;