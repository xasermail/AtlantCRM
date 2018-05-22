/* проверка на наличие действующего абонемента у человека */

if exists(select 1 from sys.procedures as a where a.name = 'HAS_DEYSTV_ABON') drop procedure dbo.HAS_DEYSTV_ABON;

GO

create procedure [dbo].[HAS_DEYSTV_ABON]
  @o_ank_id int,
  @m_org_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

declare @d smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);

select
  count(*) cnt
from
  dbo.O_SKLAD_RAS r
  join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
  join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
where
  r.O_ANK_ID = @o_ank_id
  and p.IS_ABON = 1
  and @d between rp.D_VID and rp.D_DEISTV
;
  
end;

go


set dateformat dmy;
exec dbo.HAS_DEYSTV_ABON @o_ank_id = 79, @m_org_id = 1;