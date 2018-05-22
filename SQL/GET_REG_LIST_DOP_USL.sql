/* получить список абонементов с доп услугами по анкете */

if exists(select 1 from sys.procedures as a where a.name = 'GET_REG_LIST_DOP_USL') drop procedure dbo.GET_REG_LIST_DOP_USL;

GO

create procedure [dbo].[GET_REG_LIST_DOP_USL]
	@o_ank_id int,
  @m_org_id int
as begin
  
  declare @d smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);

  select
    p.ID,
    mp.NAME,
    p.KOLVO_POS,
    -- признак того, что сегодня уже изменялось (уменьшалось)
    case when d.ID is not null then 1 else 0 end IZM,
    p.ID O_SKLAD_RAS_PRODUCT_ID,
    r.O_ANK_ID O_ANK_ID
  from
    dbo.O_SKLAD_RAS r
    join dbo.O_SKLAD_RAS_PRODUCT p on p.O_SKLAD_RAS_ID = r.ID
    left join dbo.M_PRODUCT mp on mp.ID = p.M_PRODUCT_ID
    left join dbo.O_ABON_DOP_USL_IZM d on d.O_SKLAD_RAS_PRODUCT_ID = p.ID and d.D_IZM = @d
  where
		r.O_ANK_ID = @o_ank_id
    -- либо количество больше нуля, либо количество стало ноль сегодня (просто чтобы было видно, что сегодня эта доп. услуга была использована)
    and (p.KOLVO_POS > 0 or p.KOLVO_POS = 0 and d.ID is not null)

 -- последний зарегистрированный отображается в самом верху
  order by
    mp.ID
	;
  
end;

go



exec dbo.GET_REG_LIST_DOP_USL @o_ank_id = 7, @m_org_id = 1;