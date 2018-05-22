/* Список дат посещений по абонементу */

if exists(select 1 from sys.procedures as a where a.name = 'GET_ABON_POS_LIST') drop procedure dbo.GET_ABON_POS_LIST;

GO

create procedure [dbo].[GET_ABON_POS_LIST]
  @o_ank_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;
-- чтобы конкатенация null и строки давала строку
set concat_null_yields_null off;

select
  cast(isnull(s.D_REG, s.D_START) as date) d_pos,
  case when pr2.ID is not null then pr2.NAME + ': 1, ' end str_kolvo_osn,
  case when izm.ID is not null then p1.NAME + ': 1, ' end str_kolvo_dop
from
  dbo.O_SEANS s

  -- списание доп. услуг в дату сеанса
  left join dbo.O_ABON_DOP_USL_IZM izm on izm.O_ANK_ID = s.O_ANK_ID and izm.D_IZM = cast(isnull(s.D_REG, s.D_START) as date)
  left join dbo.O_SKLAD_RAS_PRODUCT pr1 on pr1.ID = izm.O_SKLAD_RAS_PRODUCT_ID
  left join dbo.M_PRODUCT p1 on p1.ID = pr1.M_PRODUCT_ID

  -- основной абонемент, действующий на дату сеанса
  left join dbo.O_SKLAD_RAS r2 on r2.O_ANK_ID = s.O_ANK_ID
  left join 
    -- из всех товаров берём только абоементы
    (dbo.O_SKLAD_RAS_PRODUCT p2 
     join dbo.M_PRODUCT pr2 on pr2.ID = p2.M_PRODUCT_ID
                               and pr2.IS_ABON = 1
    ) on p2.O_SKLAD_RAS_ID = r2.ID
         and cast(isnull(s.D_REG, s.D_START) as date) between p2.D_VID and p2.D_DEISTV
where
  s.O_ANK_ID = @o_ank_id
  -- посещение, если дата регистрации заполнена, либо проведён без регистрации (редко)
  and (s.D_REG is not null or s.BEZ_REG = 1)
  -- берём посещения, которые были в момент действия основного абонемента
  and (
        exists(
          select
            *
          from
            dbo.O_SKLAD_RAS r
            join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
            join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
          where
            r.O_ANK_ID = s.O_ANK_ID
            and p.IS_ABON = 1
            and cast(isnull(s.D_REG, s.D_START) as date) between rp.D_VID and rp.D_DEISTV
        ) 
        -- либо (редко) если абонемента основного не было, но были оказаны доп. услуги
        or
        exists(
          select
              *
          from
            dbo.O_ABON_DOP_USL_IZM izm
          where
            izm.O_ANK_ID = s.O_ANK_ID
            and izm.D_IZM = cast(isnull(s.D_REG, s.D_START) as date)
        )
      )
order by
  d_pos desc
;
  
end;

go


set dateformat dmy;
exec dbo.GET_ABON_POS_LIST @o_ank_id = 7;


-- select * from dbo.o_abon_dop_usl_izm where o_ank_id = 79
-- select * from dbo.o_seans where o_ank_id = 79
-- select * from dbo.o_sklad_ras_product where o_sklad_ras_id in (select id from dbo.o_sklad_ras where o_ank_id = 79)
-- select * from dbo.o_ank where id = 79