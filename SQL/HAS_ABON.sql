/* проверка на наличие любого абонемента у человека, даже если он уже не действует */

if exists(select 1 from sys.procedures as a where a.name = 'HAS_ABON') drop procedure dbo.HAS_ABON;

GO

create procedure [dbo].[HAS_ABON]
  @o_ank_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;


select
  count(*) cnt
from
  dbo.O_SKLAD_RAS r
  join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
  join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
where
  r.O_ANK_ID = @o_ank_id
  and p.IS_ABON = 1
;
  
end;

go


set dateformat dmy;
exec dbo.HAS_ABON @o_ank_id = 79;