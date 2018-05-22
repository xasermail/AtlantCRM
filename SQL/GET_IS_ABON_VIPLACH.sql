/* проверка на наличие непросроченной выплаты по абонементу 
   т.е. сумма за абонемент оплачена не полностью, но при этом ещЄ не наступила дата к которой нужно
   выплатить всю сумму целиком */

BEGIN TRY
    DROP FUNCTION [dbo].[GET_IS_ABON_VIPLACH];
END TRY
BEGIN CATCH
    PRINT 'Function did not exist.';
END CATCH

GO

create function [dbo].[GET_IS_ABON_VIPLACH](
  -- ID анкеты
  @o_ank_id int,
  -- организаци€
	@m_org_id int
) returns int
	
as begin


declare @cnt int;

-- ¬»ƒ —ќЅџ“»я ¬ ”¬≈ƒќћЋ≈Ќ»» - ƒќѕЋј“ј
DECLARE @M_VID_SOB_DOPLATA INT = 5;

declare @d smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);

select
  @cnt = count(*)
from
  dbo.O_SKLAD_RAS r
  join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
  join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
  join dbo.O_UVEDOML u on u.O_SKLAD_RAS_ID = r.ID
where
  r.O_ANK_ID = @o_ank_id
  and p.IS_ABON = 1
  and u.M_VID_SOB_ID = @M_VID_SOB_DOPLATA
  and isnull(rp.OPL_OST,0) > 0
  and u.D_SOB > @d
;

return @cnt;


end;

go


select dbo.GET_IS_ABON_VIPLACH(2527, 2);