/* вернуть количество дней до окончания действия последнего купленного абонемента */

BEGIN TRY
  DROP FUNCTION [dbo].[GET_ABON_DAY_COUNT_LAST];
END TRY
BEGIN CATCH
  PRINT 'Function did not exist.';
END CATCH

GO

create function [dbo].[GET_ABON_DAY_COUNT_LAST](
  @o_ank_id int,
  @m_org_id int
) returns int
	
as begin

  declare @ostalos_dn_abon int;

  select top 1
    @ostalos_dn_abon = dbo.GET_ABON_DAY_COUNT(p.D_DEISTV, @m_org_id) 
  from
    dbo.O_SKLAD_RAS r
    join dbo.O_SKLAD_RAS_PRODUCT p on p.O_SKLAD_RAS_ID = r.ID
    join dbo.M_PRODUCT mp on mp.ID = p.M_PRODUCT_ID
  where
    r.O_ANK_ID = @o_ank_id
    and mp.IS_ABON = 1
    and p.D_DEISTV is not null
  order by
    p.D_DEISTV desc
  ;

  return isnull(@ostalos_dn_abon, 0);

end;

go

set dateformat dmy;
declare @o_ank_id int = 84;
declare @m_org_id int = 1;
select dbo.GET_ABON_DAY_COUNT_LAST(@o_ank_id, @m_org_id);